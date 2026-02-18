from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from backend.core.database import get_db
from backend.models.user import User, UserRole
from backend.models.doctor import Doctor
from backend.models.patient import Patient
from backend.models.laboratory import Laboratory
from backend.models.otp import OTPVerification
from backend.schemas.auth import EmailSchema, VerifyOTPSchema, DoctorRegisterSchema, PatientRegisterSchema, LabRegisterSchema, LoginSchema, Token
from backend.services.email import send_email
from backend.services.otp import create_otp
from backend.core.security import get_password_hash, verify_password, create_access_token
from backend.core.config import settings
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
import qrcode
import os

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def generate_patient_qr(user_id: str):
    # Ensure directory exists
    qr_dir = "backend/static/qrcodes"
    os.makedirs(qr_dir, exist_ok=True)
    
    # Data to encode (just the User ID for now, or a deep link)
    qr_data = str(user_id)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    file_path = f"{qr_dir}/{user_id}.png"
    img.save(file_path)
    
    return file_path, qr_data

@router.post("/register-request/doctor")
async def register_request_doctor(data: DoctorRegisterSchema, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # ... logic same as before but specifically for doctor ...
    return await handle_register_request(data, UserRole.doctor, db, background_tasks)

@router.post("/register-request/patient")
async def register_request_patient(data: PatientRegisterSchema, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    return await handle_register_request(data, UserRole.patient, db, background_tasks)

@router.post("/register-request/lab")
async def register_request_lab(data: LabRegisterSchema, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    return await handle_register_request(data, UserRole.lab, db, background_tasks)

# Shared Logic
async def handle_register_request(data, role: UserRole, db: AsyncSession, background_tasks: BackgroundTasks):
    print(f"DEBUG: Using SMTP Server: {settings.SMTP_SERVER}, Role: {role}")
    print(f"DEBUG: Received Registration Data: {data.dict()}")

    # Check if user exists
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()

    if user and user.is_verified:
        raise HTTPException(status_code=400, detail="User already registered")

    if not user:
        # Create unverified user
        user = User(
            email=data.email, 
            password_hash=get_password_hash(data.password), 
            role=role, 
            is_verified=False
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update existing unverified user
        user.password_hash = get_password_hash(data.password)
        # Ensure role matches or allow switching? For simplicity, assume role matches request
        user.role = role 
        # (If user tries to register as Patient then Doctor with same email before verifying, role will flip. That's acceptable for now).

    # Create/Update Profile based on Role
    if role == UserRole.doctor:
        await create_or_update_doctor(user.id, data, db)
    elif role == UserRole.patient:
        await create_or_update_patient(user.id, data, db)
    elif role == UserRole.lab:
        await create_or_update_lab(user.id, data, db)
    
    await db.commit() # Commit profile changes

    # Generate OTP
    otp_code = await create_otp(db, user.id)
    
    # Send Email
    subject = "MediGuard Registration OTP"
    body = f"Your OTP is: {otp_code}. It expires in 10 minutes."
    import logging
    logging.info(f" [OTP-DEBUG] generated OTP for {data.email}: {otp_code} ")
    
    background_tasks.add_task(send_email, data.email, subject, body)
    
    return {"message": "Registration initiated. OTP sent to email."}

async def create_or_update_doctor(user_id, data, db):
    result = await db.execute(select(Doctor).where(Doctor.user_id == user_id))
    profile = result.scalars().first()
    if not profile:
        profile = Doctor(user_id=user_id)
        db.add(profile)
    
    profile.full_name = data.full_name
    profile.license_number = data.license_number
    profile.specialization = data.specialization
    profile.hospital_name = data.hospital_name
    profile.city = data.city

async def create_or_update_patient(user_id, data, db):
    result = await db.execute(select(Patient).where(Patient.user_id == user_id))
    profile = result.scalars().first()
    
    # Generate QR Code immediately (or could wait for verification)
    qr_path, qr_token = generate_patient_qr(user_id)

    if not profile:
        profile = Patient(user_id=user_id)
        db.add(profile)
    
    profile.full_name = data.full_name
    profile.date_of_birth = datetime.strptime(data.date_of_birth, "%Y-%m-%d").date()
    profile.gender = data.gender
    profile.blood_group = data.blood_group
    profile.address = data.address
    profile.city = data.city
    profile.state = data.state
    profile.pincode = data.pincode
    profile.emergency_name = data.emergency_name
    profile.emergency_phone = data.emergency_phone
    profile.emergency_relation = data.emergency_relation
    profile.qr_token = qr_token
    profile.qr_path = qr_path

async def create_or_update_lab(user_id, data, db):
    result = await db.execute(select(Laboratory).where(Laboratory.user_id == user_id))
    profile = result.scalars().first()
    if not profile:
        profile = Laboratory(user_id=user_id)
        db.add(profile)
    
    profile.lab_name = data.lab_name
    profile.license_number = data.license_number
    # profile.accreditation_number = data.accreditation_number # Add this field to schema if needed
    profile.address = data.address
    profile.city = data.city
    profile.lab_head_name = data.lab_head_name
    # profile.tests_available = data.tests_available

# Keep the old endpoint for backward compatibility (Doctor)
@router.post("/register-request")
async def register_request(data: DoctorRegisterSchema, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    return await register_request_doctor(data, background_tasks, db)


@router.post("/verify-registration", response_model=Token)
async def verify_registration(data: VerifyOTPSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    result = await db.execute(
        select(OTPVerification)
        .where(OTPVerification.user_id == user.id)
        .where(OTPVerification.otp_hash == data.otp)
        .where(OTPVerification.expires_at > datetime.utcnow())
        .order_by(OTPVerification.created_at.desc())
    )
    otp_record = result.scalars().first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Mark verified
    user.is_verified = True
    await db.commit()
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value, "user_id": user.id}

@router.post("/login")
async def login(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.is_verified:
        raise HTTPException(status_code=401, detail="User not verified")

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value, "user_id": user.id}
