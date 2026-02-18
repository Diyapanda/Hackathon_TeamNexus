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

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True
