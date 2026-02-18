from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from backend.core.database import Base

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True) # Added
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    blood_group = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    
    # Emergency Contact
    emergency_name = Column(String, nullable=True)
    emergency_phone = Column(String, nullable=True)
    emergency_relation = Column(String, nullable=True)
    
    # QR Code
    qr_token = Column(String, unique=True, nullable=True) # Token encoded in QR
    qr_path = Column(String, nullable=True) # Path to image file
    qr_generated_at = Column(DateTime, default=datetime.utcnow)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
