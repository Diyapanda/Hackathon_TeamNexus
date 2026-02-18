from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class EmailSchema(BaseModel):
    email: EmailStr

class VerifyOTPSchema(BaseModel):
    email: EmailStr
    otp: str

class DoctorRegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    license_number: str
    specialization: str
    hospital_name: str
    city: str

class PatientRegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: str # Added
    date_of_birth: str  # YYYY-MM-DD
    gender: str
    blood_group: str
    address: str
    city: str
    state: str
    pincode: str
    emergency_name: str
    emergency_phone: str
    emergency_relation: str

class LabRegisterSchema(BaseModel):
    lab_name: str
    email: EmailStr
    password: str
    license_number: str
    accreditation_number: Optional[str] = None
    address: str
    city: str
    lab_head_name: str
    tests_available: Optional[list] = []

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: UUID # Added for frontend to fetch QR code

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True
