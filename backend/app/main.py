from fastapi import FastAPI, Depends, HTTPException, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .core.database import engine, Base, get_db
from .models import models
from .services.gemini import GeminiService
import shutil
import os

UPLOAD_DIR = "uploads"
PROFILE_PICS_DIR = os.path.join(UPLOAD_DIR, "profile_pics")
os.makedirs(PROFILE_PICS_DIR, exist_ok=True)
from pydantic import BaseModel
from typing import List, Optional
import uuid

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Schemas
class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    patient_context: dict

class ProfileUpdate(BaseModel):
    full_name: str
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    emergency_name: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_relation: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "MediGuard Backend API is running"}

@app.get("/api/patient/profile")
def get_profile(db: Session = Depends(get_db)):
    # For demo, just get the first patient
    patient = db.query(models.Patient).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    user = db.query(models.User).filter(models.User.id == patient.user_id).first()
    
    # Map to frontend format
    profile_photo = f"http://localhost:8000{user.profile_photo_url}" if user.profile_photo_url else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"
    
    return {
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "dob": patient.date_of_birth.isoformat(),
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "address": patient.address,
        "city": patient.city,
        "state": patient.state,
        "pincode": patient.pincode,
        "emergency_name": patient.emergency_name,
        "emergency_phone": patient.emergency_phone,
        "emergency_relation": patient.emergency_relation,
        "profile_photo": profile_photo,
        "patient_uid": patient.qr_token,
        "qr_code_url": f"http://localhost:8000{patient.qr_path}" if patient.qr_path else None
    }

@app.put("/api/patient/profile")
def update_profile(update: ProfileUpdate, db: Session = Depends(get_db)):
    # For demo, just get the first patient
    patient = db.query(models.Patient).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    user = db.query(models.User).filter(models.User.id == patient.user_id).first()
    
    user.full_name = update.full_name
    user.phone = update.phone
    
    patient.address = update.address
    patient.city = update.city
    patient.state = update.state
    patient.pincode = update.pincode
    patient.emergency_name = update.emergency_name
    patient.emergency_phone = update.emergency_phone
    patient.emergency_relation = update.emergency_relation
    
    db.commit()
    return {"message": "Profile updated successfully"}

@app.get("/api/patient/history")
def get_history(db: Session = Depends(get_db)):
    # Get all consultations
    consultations = db.query(models.Consultation).order_by(models.Consultation.consultation_time.desc()).all()
    
    history = []
    for c in consultations:
        doctor = db.query(models.Doctor).filter(models.Doctor.id == c.doctor_id).first()
        doctor_user = db.query(models.User).filter(models.User.id == doctor.user_id).first() if doctor else None
        
        entry = {
            "id": str(c.id),
            "type": "visit",
            "date": c.consultation_time.strftime("%d %b %Y"),
            "time": c.consultation_time.strftime("%I:%M %p"),
            "doctor_name": doctor_user.full_name if doctor_user else "Unknown Doctor",
            "hospital_name": doctor.hospital_name if doctor else "City Hospital",
            "specialty": doctor.specialization if doctor else "General Physician",
            "diagnosis": c.notes,
            "vitals": {
                "heart_rate": "72 bpm",
                "bp": "120/80",
                "temp": "98.6 F"
            },
            "prescription": [
                {
                    "medicine": p.medication_details,
                    "duration": p.duration,
                    "pdf_url": f"http://localhost:8000{p.attachment_url}" if p.attachment_url else None
                } for p in db.query(models.Prescription).filter(models.Prescription.consultation_id == c.id).all()
            ]
        }
        history.append(entry)
    
    # Add lab reports
    reports = db.query(models.LabReport).all()
    for r in reports:
        order = db.query(models.LabTestOrder).filter(models.LabTestOrder.id == r.lab_test_order_id).first()
        test = db.query(models.LabTest).filter(models.LabTest.id == order.test_id).first() if order else None
        lab = db.query(models.Laboratory).filter(models.Laboratory.id == order.lab_id).first() if order else None
        
        entry = {
            "id": str(r.id),
            "type": "lab_report",
            "date": r.created_at.strftime("%d %b %Y"),
            "test_name": test.test_name if test else "Laboratory Test",
            "laboratory": lab.lab_name if lab else "Central Lab",
            "status": r.status,
            "results": r.report_data,
            "pdf_url": f"http://localhost:8000{r.attachment_url}" if r.attachment_url else None
        }
        history.append(entry)
        
    return history

@app.get("/api/patient/connections")
def get_connections(db: Session = Depends(get_db)):
    # In this schema, we only have DoctorPatientAccess, so let's mock Labs for now or query LabTestOrders
    accesses = db.query(models.DoctorPatientAccess).all()
    connections = []
    
    # Add Doctors
    for a in accesses:
        doctor = db.query(models.Doctor).filter(models.Doctor.id == a.doctor_id).first()
        user = db.query(models.User).filter(models.User.id == doctor.user_id).first()
        
        connections.append({
            "id": str(a.id),
            "entity_name": user.full_name,
            "entity_type": "doctor",
            "doc_id": doctor.license_number,
            "specialty": doctor.specialization,
            "hospital_name": doctor.hospital_name,
            "city": doctor.city,
            "status": "active" if a.access_status == "approved" else "pending"
        })
        
    # Add Labs (Based on LabTestOrders for this demo)
    orders = db.query(models.LabTestOrder).all()
    seen_labs = set()
    for o in orders:
        if o.lab_id in seen_labs: continue
        seen_labs.add(o.lab_id)
        
        lab = db.query(models.Laboratory).filter(models.Laboratory.id == o.lab_id).first()
        user = db.query(models.User).filter(models.User.id == lab.user_id).first()
        
        connections.append({
            "id": str(lab.id),
            "entity_name": lab.lab_name,
            "entity_type": "laboratory",
            "lab_id": lab.license_number,
            "lab_head_name": lab.lab_head_name or "Dr. Vikas Khanna",
            "tests_available": lab.tests_available or ["Blood Test", "MRI", "X-Ray"],
            "city": lab.city,
            "status": "active"
        })
        
    return connections

@app.post("/api/patient/connections/{access_id}/approve")
def approve_connection(access_id: str, db: Session = Depends(get_db)):
    access = db.query(models.DoctorPatientAccess).filter(models.DoctorPatientAccess.id == access_id).first()
    if not access:
        raise HTTPException(status_code=404, detail="Access request not found")
    
    access.access_status = "approved"
    access.approved_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Access approved successfully"}

@app.delete("/api/patient/connections/{access_id}/reject")
def reject_connection(access_id: str, db: Session = Depends(get_db)):
    access = db.query(models.DoctorPatientAccess).filter(models.DoctorPatientAccess.id == access_id).first()
    if not access:
        raise HTTPException(status_code=404, detail="Access request not found")
    
    db.delete(access)
    db.commit()
    return {"message": "Access request rejected and removed"}

@app.delete("/api/patient/connections/{id}/revoke")
def revoke_connection(id: str, db: Session = Depends(get_db)):
    # The ID passed can be a DoctorPatientAccess ID or a Lab ID in this demo 
    access = db.query(models.DoctorPatientAccess).filter(models.DoctorPatientAccess.id == id).first()
    if access:
        db.delete(access)
        db.commit()
        return {"message": "Doctor access revoked"}
    
    # Check if it's a Laboratory ID (demo logic)
    # Since Labs don't have explicit access records in this demo schema,
    # we just return success to mock the revocation
    return {"message": "Access revoked"}

@app.post("/api/patient/profile/upload-photo")
async def upload_profile_photo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # In a real app, we'd get the current user ID from a token
    # For this demo, we assume the first patient
    patient = db.query(models.Patient).first()
    user = db.query(models.User).filter(models.User.id == patient.user_id).first()
    
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"profile_{user.id}{file_extension}"
    file_path = os.path.join(PROFILE_PICS_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    user.profile_photo_url = f"/uploads/profile_pics/{file_name}"
    db.commit()
    
    return {"photo_url": f"http://localhost:8000{user.profile_photo_url}"}

@app.get("/api/patient/operations")
def get_operations(db: Session = Depends(get_db)):
    # Since operations table is technically missing from SQL, we'll return an empty list or mock from DB if we added it.
    # I'll just return empty for now to avoid crashes.
    return []

@app.post("/api/ai/chat")
async def ai_chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Enrich context if empty
    context = request.patient_context
    if not context:
        patient = db.query(models.Patient).first()
        if patient:
            user = db.query(models.User).filter(models.User.id == patient.user_id).first()
            # Basic profile
            context["patient_name"] = user.full_name
            context["blood_group"] = patient.blood_group
            
            # History summary
            consultations = db.query(models.Consultation).all()
            context["medical_history"] = [
                {"date": c.consultation_time.isoformat(), "notes": c.notes}
                for c in consultations
            ]
            
            # Connections
            accesses = db.query(models.DoctorPatientAccess).filter(models.DoctorPatientAccess.access_status == "approved").all()
            authorized_doctors = []
            for a in accesses:
                doc = db.query(models.Doctor).filter(models.Doctor.id == a.doctor_id).first()
                doc_user = db.query(models.User).filter(models.User.id == doc.user_id).first()
                authorized_doctors.append(doc_user.full_name)
            context["authorized_doctors"] = authorized_doctors

    response = await GeminiService.get_chat_response(
        request.message, 
        request.history, 
        context
    )
    return {"response": response}

@app.post("/api/ai/summarize")
async def summarize_report(doc_type: str, data: dict):
    summary = await GeminiService.generate_summary(doc_type, data)
    return {"summary": summary}
