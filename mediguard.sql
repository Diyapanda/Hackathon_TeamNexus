CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM (
    'patient',
    'doctor',
    'lab',
    'authority'
);

CREATE TYPE gender_enum AS ENUM (
    'male',
    'female',
    'other'
);

CREATE TYPE access_status_enum AS ENUM (
    'pending',
    'approved',
    'revoked'
);

CREATE TYPE lab_order_status AS ENUM (
    'ordered',
    'completed',
    'reviewed'
);

CREATE TYPE report_status_enum AS ENUM (
    'completed',
    'reviewed'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender gender_enum NOT NULL,
    blood_group VARCHAR(5),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    emergency_contact VARCHAR(20),
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    qr_path TEXT,
    qr_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    specialization VARCHAR(150),
    hospital_name VARCHAR(150),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE laboratories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    lab_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100),
    accreditation_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    lab_head_name VARCHAR(150),
    tests_available JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_patient_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    access_status access_status_enum DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    UNIQUE (doctor_id, patient_id)
);

CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_code VARCHAR(50) UNIQUE NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    is_notifiable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    disease_id UUID REFERENCES diseases(id),
    symptoms TEXT,
    notes TEXT,
    diagnosis_confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consultation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    temperature NUMERIC(4,1),
    blood_pressure VARCHAR(20),
    heart_rate INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    medication_details TEXT,
    duration VARCHAR(100),
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    normal_range_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_test_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES laboratories(id),
    test_id UUID REFERENCES lab_tests(id),
    status lab_order_status DEFAULT 'ordered',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_test_order_id UUID REFERENCES lab_test_orders(id) ON DELETE CASCADE,
    disease_id UUID REFERENCES diseases(id),
    report_type VARCHAR(150),
    report_data JSONB,
    attachment_url TEXT,
    status report_status_enum DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW disease_surveillance AS
SELECT
    d.disease_code,
    d.disease_name,
    p.state,
    p.city,
    DATE(c.diagnosis_confirmed_at) AS report_date,
    COUNT(*) AS total_cases
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN diseases d ON c.disease_id = d.id
GROUP BY d.disease_code, d.disease_name, p.state, p.city, DATE(c.diagnosis_confirmed_at);

-- Migration: Add emergency contact details and address fields to patients
ALTER TABLE patients
RENAME COLUMN emergency_contact TO emergency_phone;

ALTER TABLE patients
ADD COLUMN emergency_name VARCHAR(150),
ADD COLUMN emergency_relation VARCHAR(100);

-- Seed Data: Basic Diseases
INSERT INTO diseases (disease_code, disease_name) VALUES
('E11', 'Type 2 Diabetes Mellitus'),
('I10', 'Essential Hypertension')
ON CONFLICT (disease_code) DO NOTHING;

-- Seed Data: Users and Profiles (Example)
-- Note: UUIDs are generated automatically. This is for demonstration.
INSERT INTO users (email, phone, password_hash, role, full_name, is_verified) VALUES
('rajesh.kumar@email.com', '+91 98765 43210', 'hashed_password', 'patient', 'Rajesh Kumar', TRUE),
('dr.sharma@mediguard.com', '+91 99887 76655', 'hashed_password', 'doctor', 'Dr. Anjali Sharma', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed Data: Lab Tests
INSERT INTO lab_tests (test_name, category, normal_range_info) VALUES
('Lipid Profile', 'Blood Test', 'Cholesterol < 200 mg/dL'),
('Complete Blood Count', 'Blood Test', 'WBC: 4k-11k/mcL')
ON CONFLICT (test_name) DO NOTHING;

