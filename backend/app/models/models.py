from ..core.database import Base
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Boolean, JSON, Text, Numeric, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    password_hash = Column(Text, nullable=False)
    role = Column(String, nullable=False) # 'patient', 'doctor', 'lab', 'authority'
    full_name = Column(String(150), nullable=False)
    profile_photo_url = Column(Text)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_login_at = Column(DateTime)

    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    lab_profile = relationship("Laboratory", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String, nullable=False) # 'male', 'female', 'other'
    blood_group = Column(String(5))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    emergency_name = Column(String(150))
    emergency_phone = Column(String(20))
    emergency_relation = Column(String(100))
    qr_token = Column(String(255), unique=True, nullable=False)
    qr_path = Column(Text)
    qr_generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="patient_profile")
    consultations = relationship("Consultation", back_populates="patient")
    doctor_access = relationship("DoctorPatientAccess", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    license_number = Column(String(100))
    specialization = Column(String(150))
    hospital_name = Column(String(150))
    city = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="doctor_profile")
    consultations = relationship("Consultation", back_populates="doctor")

class Laboratory(Base):
    __tablename__ = "laboratories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    lab_name = Column(String(150))
    license_number = Column(String(100))
    accreditation_number = Column(String(100))
    address = Column(Text)
    city = Column(String(100))
    lab_head_name = Column(String(150))
    tests_available = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="lab_profile")

class Disease(Base):
    __tablename__ = "diseases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    disease_code = Column(String(50), unique=True, nullable=False)
    disease_name = Column(String(150), nullable=False)
    is_notifiable = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"))
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"))
    symptoms = Column(Text)
    notes = Column(Text)
    diagnosis_confirmed_at = Column(DateTime, default=datetime.datetime.utcnow)
    consultation_time = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="consultations")
    doctor = relationship("Doctor", back_populates="consultations")
    prescription = relationship("Prescription", back_populates="consultation", uselist=False)
    lab_orders = relationship("LabTestOrder", back_populates="consultation")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="CASCADE"))
    medication_details = Column(Text)
    duration = Column(String(100))
    attachment_url = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    consultation = relationship("Consultation", back_populates="prescription")

class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_name = Column(String(150), nullable=False)
    category = Column(String(100))
    normal_range_info = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LabTestOrder(Base):
    __tablename__ = "lab_test_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="CASCADE"))
    lab_id = Column(UUID(as_uuid=True), ForeignKey("laboratories.id"))
    test_id = Column(UUID(as_uuid=True), ForeignKey("lab_tests.id"))
    status = Column(String, default="ordered") # 'ordered', 'completed', 'reviewed'
    ordered_at = Column(DateTime, default=datetime.datetime.utcnow)

    consultation = relationship("Consultation", back_populates="lab_orders")
    report = relationship("LabReport", back_populates="test_order", uselist=False)

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lab_test_order_id = Column(UUID(as_uuid=True), ForeignKey("lab_test_orders.id", ondelete="CASCADE"))
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"))
    report_type = Column(String(150))
    report_data = Column(JSON)
    attachment_url = Column(Text)
    status = Column(String, default="completed") # 'completed', 'reviewed'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    test_order = relationship("LabTestOrder", back_populates="report")

class DoctorPatientAccess(Base):
    __tablename__ = "doctor_patient_access"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="CASCADE"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"))
    access_status = Column(String, default="pending") # 'pending', 'approved', 'revoked'
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    approved_at = Column(DateTime)

    patient = relationship("Patient", back_populates="doctor_access")
