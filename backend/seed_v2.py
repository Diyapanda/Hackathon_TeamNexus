import uuid
import os
import requests
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import models

UPLOAD_DIR = "uploads"
QR_DIR = os.path.join(UPLOAD_DIR, "qr")
REPORTS_DIR = os.path.join(UPLOAD_DIR, "reports")
PRESCRIPTIONS_DIR = os.path.join(UPLOAD_DIR, "prescriptions")
PROFILE_PICS_DIR = os.path.join(UPLOAD_DIR, "profile_pics")

def download_qr(qr_token):
    url = f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={qr_token}"
    path = os.path.join(QR_DIR, f"{qr_token}.png")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            with open(path, 'wb') as f:
                f.write(response.content)
            return f"/uploads/qr/{qr_token}.png"
    except Exception as e:
        print(f"Error downloading QR: {e}")
    return None

def create_dummy_pdf(filename, directory):
    path = os.path.join(directory, filename)
    with open(path, 'w') as f:
        f.write("%PDF-1.4\n%Dummy PDF content for MediGuard")
    return f"/uploads/{os.path.relpath(path, UPLOAD_DIR)}"

def seed_data():
    db = SessionLocal()
    
    # Refresh tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("Seeding database...")

    # 1. Create Patient User
    patient_user = models.User(
        email="rajesh.kumar@email.com",
        phone="+91 98765 43210",
        password_hash="hashed_password",
        role="patient",
        full_name="Rajesh Kumar",
        profile_photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        is_verified=True
    )
    db.add(patient_user)
    db.commit()
    db.refresh(patient_user)

    # 2. Create Patient Profile
    patient_profile = models.Patient(
        user_id=patient_user.id,
        date_of_birth=date(1985, 6, 15),
        gender="male",
        blood_group="O+",
        address="123, MG Road",
        city="Bangalore",
        state="Karnataka",
        pincode="560001",
        emergency_contact="+91 98765 67890",
        qr_token="PT-2024-001234",
        qr_path=download_qr("PT-2024-001234")
    )
    db.add(patient_profile)
    db.commit()
    db.refresh(patient_profile)

    # 3. Create Doctor User & Profile
    doctor_user = models.User(
        email="dr.sharma@mediguard.com",
        phone="+91 99887 76655",
        password_hash="hashed_password",
        role="doctor",
        full_name="Dr. Anjali Sharma",
        is_verified=True
    )
    db.add(doctor_user)
    db.commit()
    db.refresh(doctor_user)

    doctor = models.Doctor(
        user_id=doctor_user.id,
        license_number="KMC-2010-045",
        specialization="Cardiology",
        hospital_name="Apollo Hospital",
        city="Bangalore"
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    # 4. Create Lab User & Profile
    lab_user = models.User(
        email="lab@central.com",
        role="lab",
        full_name="Central Diagnostics",
        is_verified=True,
        password_hash="hashed_password"
    )
    db.add(lab_user)
    db.commit()
    db.refresh(lab_user)

    lab = models.Laboratory(
        user_id=lab_user.id,
        lab_name="Central Diagnostics",
        license_number="LAB-001",
        city="Bangalore",
        lab_head_name="Dr. Somesh Gupta",
        tests_available=["Full Body Checkup", "COVID-19 RT-PCR", "Lipid Profile", "Thyroid Profile"]
    )
    db.add(lab)

    # 5. Create Diseases
    diabetes = models.Disease(
        disease_code="E11",
        disease_name="Type 2 Diabetes Mellitus"
    )
    hypertension = models.Disease(
        disease_code="I10",
        disease_name="Essential Hypertension"
    )
    db.add_all([diabetes, hypertension])
    db.commit()

    # 6. Create Consultation
    consultation = models.Consultation(
        patient_id=patient_profile.id,
        doctor_id=doctor.id,
        disease_id=hypertension.id,
        symptoms="Mild chest pain, headache",
        notes="Blood pressure slightly elevated. Prescribed medication and recommended light exercise.",
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # 7. Create Prescription
    prescription = models.Prescription(
        consultation_id=consultation.id,
        medication_details="Amlodipine 5mg (Once daily), Ecosprin 75mg (Once daily)",
        duration="3 months",
        attachment_url=create_dummy_pdf(f"prescription_{consultation.id}.pdf", PRESCRIPTIONS_DIR)
    )
    db.add(prescription)

    # 8. Create Doctor Access
    access = models.DoctorPatientAccess(
        doctor_id=doctor.id,
        patient_id=patient_profile.id,
        access_status="approved",
        approved_at=datetime.utcnow()
    )
    db.add(access)

    # Added: A pending request to simulate the UI
    pending_user = models.User(
        id=uuid.uuid4(),
        full_name="Dr. Vikram Seth",
        email="vikram@apollo.com",
        password_hash="hashed_password",
        role="doctor"
    )
    db.add(pending_user)
    db.commit()

    pending_doc = models.Doctor(
        user_id=pending_user.id,
        specialization="Neurology",
        license_number="KMC-2015-999",
        hospital_name="Fortis Hospital",
        city="Mumbai"
    )
    db.add(pending_doc)
    db.commit()

    pending_access = models.DoctorPatientAccess(
        doctor_id=pending_doc.id,
        patient_id=patient_profile.id,
        access_status="pending"
    )
    db.add(pending_access)

    # Added: A third pending request from a Lab (simulated via LabReport or just another DoctorAccess if we don't have LabAccess table)
    # The current schema doesn't have a LabAccess table, so we'll just add another doctor for now or mock lab requests as "doctor" type in UI.
    # Actually, let's add a second doctor.
    another_user = models.User(
        id=uuid.uuid4(),
        full_name="Dr. Sarah Jenkins",
        email="sarah@global.com",
        password_hash="hashed_password",
        role="doctor"
    )
    db.add(another_user)
    db.commit()

    another_doc = models.Doctor(
        user_id=another_user.id,
        specialization="Cardiology",
        license_number="KMC-2018-777",
        hospital_name="City Heart Center",
        city="Bangalore"
    )
    db.add(another_doc)
    db.commit()

    another_access = models.DoctorPatientAccess(
        doctor_id=another_doc.id,
        patient_id=patient_profile.id,
        access_status="pending"
    )
    db.add(another_access)

    # 9. Create Lab Test & Report
    lab_user = models.User(
        id=uuid.uuid4(),
        full_name="Metro Diagnostics",
        email="metro@labs.com",
        password_hash="hashed_password",
        role="lab" # Changed role to 'lab'
    )
    db.add(lab_user)
    db.commit()

    metro_lab = models.Laboratory( # Renamed variable to avoid conflict with existing 'lab'
        user_id=lab_user.id,
        lab_name="Metro Diagnostics Center",
        license_number="LAB-998877",
        city="Bangalore",
        lab_head_name="Dr. Priya Singh", # Added lab_head_name
        tests_available=["Lipid Profile", "Thyroid Profile"] # Added tests_available
    )
    db.add(metro_lab)
    db.commit()

    lab_test = models.LabTest(
        test_name="Lipid Profile",
        category="Blood Test", # Changed test_category to category
        normal_range_info="Cholesterol < 200 mg/dL" # Added normal_range_info
    )
    db.add(lab_test)
    db.commit()
    db.refresh(lab_test) # Added refresh

    lab_order = models.LabTestOrder(
        consultation_id=consultation.id,
        lab_id=metro_lab.id, # Used metro_lab.id
        test_id=lab_test.id,
        status="completed"
    )
    db.add(lab_order)
    db.commit()
    db.refresh(lab_order) # Added refresh

    lab_report = models.LabReport(
        lab_test_order_id=lab_order.id, # Changed order_id to lab_test_order_id
        disease_id=hypertension.id, # Added disease_id
        report_type="Blood Report", # Added report_type
        report_data={"Cholesterol": "190", "HDL": "45", "LDL": "120"}, # Added report_data
        attachment_url=create_dummy_pdf(f"report_{lab_order.id}.pdf", REPORTS_DIR),
        status="completed" # Added status
    )
    db.add(lab_report)

    # 10. Add another Laboratory for diversity
    lab_user2 = models.User(
        id=uuid.uuid4(),
        full_name="Global Health Labs",
        email="global@labs.com",
        password_hash="hashed_password",
        role="lab"
    )
    db.add(lab_user2)
    db.commit()

    global_lab = models.Laboratory(
        user_id=lab_user2.id,
        lab_name="Global Health Labs",
        license_number="LAB-123789",
        city="Mumbai",
        lab_head_name="Dr. Arun Varma",
        tests_available=["Blood Test", "MRI", "X-Ray"]
    )
    db.add(global_lab)
    db.commit()

    # Create an order for it too so it appears in active connections
    lab_order2 = models.LabTestOrder(
        consultation_id=consultation.id,
        lab_id=global_lab.id,
        test_id=lab_test.id,
        status="ordered"
    )
    db.add(lab_order2)
    db.commit()

    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
