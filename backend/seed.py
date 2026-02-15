import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import models

def seed_data():
    db = SessionLocal()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 1. Create Patient
    patient = models.Patient(
        patient_uid="PT-2024-001234",
        full_name="Rajesh Kumar",
        email="rajesh.kumar@email.com",
        phone="+91 98765 43210",
        dob=datetime(1985, 6, 15),
        gender="Male",
        blood_group="O+",
        address="123, MG Road, Bangalore, Karnataka - 560001",
        emergency_contact_name="Priya Kumar",
        emergency_contact_phone="+91 98765 67890",
        qr_code_data="https://mediguard.ai/qr/PT-2024-001234"
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # 2. Connections
    connections = [
        models.Connection(
            patient_id=patient.id,
            entity_id="DR-101",
            entity_name="Dr. Anjali Sharma",
            entity_type="doctor",
            specialty="General Physician",
            hospital_lab="Apollo Hospital",
            status="active",
            last_visit="2024-02-10",
            total_visits=8,
            permissions=["history", "vitals", "prescriptions"]
        ),
        models.Connection(
            patient_id=patient.id,
            entity_id="DR-102",
            entity_name="Dr. Vikram Patel",
            entity_type="doctor",
            specialty="Cardiologist",
            hospital_lab="Fortis Hospital",
            status="active",
            last_visit="2024-01-25",
            total_visits=3,
            permissions=["history", "operations"]
        ),
        models.Connection(
            patient_id=patient.id,
            entity_id="LAB-201",
            entity_name="PathLab Diagnostics",
            entity_type="lab",
            hospital_lab="Indiranagar Branch",
            status="active",
            last_visit="2024-02-12",
            total_visits=5,
            permissions=["reports"]
        )
    ]
    db.add_all(connections)

    # 3. Medical History
    history_items = [
        models.MedicalHistory(
            patient_id=patient.id,
            type="visit",
            date="Feb 10, 2024",
            time="10:30 AM",
            doctor_name="Dr. Anjali Sharma",
            hospital_name="Apollo Hospital",
            specialty="General Physician",
            diagnosis="Viral Fever & Seasonal Allergy",
            vitals={"heart_rate": "78 bpm", "bp": "120/80", "temp": "100.2 °F", "spO2": "98%"},
            recommendations={"rest": "3 days", "fluids": "Plenty of water", "follow_up": "Next Friday"}
        ),
        models.MedicalHistory(
            patient_id=patient.id,
            type="lab_report",
            date="Feb 12, 2024",
            time="09:15 AM",
            test_name="Complete Blood Count",
            laboratory="PathLab Diagnostics",
            status="Completed",
            results={"wbc": "8.5k", "rbc": "5.2M", "hemoglobin": "14.5 g/dL", "platelets": "250k"},
            pdf_url="#",
            ai_summary="Your blood counts are within the healthy range. Slight elevation in eosinophils confirms the allergic reaction mentioned by your doctor."
        )
    ]
    db.add_all(history_items)

    # 4. Operations
    operations = [
        models.MajorOperation(
            patient_id=patient.id,
            procedure="Appendectomy",
            date="Aug 15, 2022",
            surgeon="Dr. Sameer Reddy",
            hospital="Manipal Hospital",
            notes="Successful laparoscopic removal of inflamed appendix. No complications."
        )
    ]
    db.add_all(operations)

    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
