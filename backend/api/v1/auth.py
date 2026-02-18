from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from backend.core.database import get_db
from backend.models.user import User, UserRole
from backend.models.doctor import Doctor
from backend.models.otp import OTPVerification
from backend.schemas.auth import EmailSchema, VerifyOTPSchema, DoctorRegisterSchema, LoginSchema, Token
from backend.services.email import send_email
from backend.services.otp import create_otp
from backend.core.security import get_password_hash, verify_password, create_access_token
from backend.core.config import settings
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register-request")
async def register_request(data: DoctorRegisterSchema, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    print(f"DEBUG: Using SMTP Server: {settings.SMTP_SERVER}") # DEBUG
    print(f"DEBUG: Received Registration Data: {data.dict()}") # DEBUG
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
            role=UserRole.doctor, 
            is_verified=False
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Create Doctor Profile
        doctor = Doctor(
            user_id=user.id,
            full_name=data.full_name,
            license_number=data.license_number,
            specialization=data.specialization,
            hospital_name=data.hospital_name,
            city=data.city
        )
        db.add(doctor)
        await db.commit()
    else:
        # User exists but not verified? Update details and password
        user.password_hash = get_password_hash(data.password)
        
        # Update doctor profile if exists
        result = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
        doctor = result.scalars().first()
        if doctor:
            doctor.full_name = data.full_name
            doctor.license_number = data.license_number
            doctor.specialization = data.specialization
            doctor.hospital_name = data.hospital_name
            doctor.city = data.city
        else:
             doctor = Doctor(
                user_id=user.id,
                full_name=data.full_name,
                license_number=data.license_number,
                specialization=data.specialization,
                hospital_name=data.hospital_name,
                city=data.city
            )
             db.add(doctor)
        await db.commit()

    # Generate OTP
    otp_code = await create_otp(db, user.id)
    
    # Send Email
    subject = "MediGuard Registration OTP"
    body = f"Your OTP is: {otp_code}. It expires in 10 minutes."
    
    # DEBUG: Print OTP to console for easy testing
    # DEBUG: Log OTP for easy testing
    import logging
    logging.info(f" [OTP-DEBUG] generated OTP for {data.email}: {otp_code} ")

    
    background_tasks.add_task(send_email, data.email, subject, body)
    
    return {"message": "Registration initiated. OTP sent to email."}

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
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}

@router.post("/login")
async def login(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.is_verified:
        raise HTTPException(status_code=401, detail="User not verified")

    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}
