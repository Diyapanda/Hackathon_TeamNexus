export const LAB_INFO = {
    name: "MedCore Diagnostics",
    certificationNo: "CERT-2024-MED-8741",
    accreditationNo: "NABL-TC-5923",
};

export const patients = [
    { healthId: "HID-1001", name: "Arjun Mehta", age: 34, gender: "Male", phone: "+91-9876543210", email: "arjun.m@email.com" },
    { healthId: "HID-1002", name: "Priya Sharma", age: 28, gender: "Female", phone: "+91-9876543211", email: "priya.s@email.com" },
    { healthId: "HID-1003", name: "Rohan Das", age: 45, gender: "Male", phone: "+91-9876543212", email: "rohan.d@email.com" },
    { healthId: "HID-1004", name: "Sneha Patel", age: 31, gender: "Female", phone: "+91-9876543213", email: "sneha.p@email.com" },
    { healthId: "HID-1005", name: "Vikram Singh", age: 52, gender: "Male", phone: "+91-9876543214", email: "vikram.s@email.com" },
    { healthId: "HID-1006", name: "Ananya Iyer", age: 26, gender: "Female", phone: "+91-9876543215", email: "ananya.i@email.com" },
    { healthId: "HID-1007", name: "Karan Gupta", age: 40, gender: "Male", phone: "+91-9876543216", email: "karan.g@email.com" },
    { healthId: "HID-1008", name: "Meera Nair", age: 37, gender: "Female", phone: "+91-9876543217", email: "meera.n@email.com" },
];

export const testRequests = [
    { id: "TR-001", healthId: "HID-1001", patientName: "Arjun Mehta", testName: "Complete Blood Count", tests: ["WBC", "RBC", "Hemoglobin", "Platelet Count", "Hematocrit"], status: "completed", date: "2026-02-13", result: "negative" },
    { id: "TR-002", healthId: "HID-1002", patientName: "Priya Sharma", testName: "Thyroid Panel", packageName: "Thyroid Complete", tests: ["TSH", "T3", "T4", "Free T3", "Free T4"], status: "in-process", date: "2026-02-13", result: "pending" },
    { id: "TR-003", healthId: "HID-1003", patientName: "Rohan Das", testName: "Lipid Profile", tests: ["Total Cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"], status: "new", date: "2026-02-13" },
    { id: "TR-004", healthId: "HID-1004", patientName: "Sneha Patel", testName: "Liver Function Test", packageName: "Hepatic Panel", tests: ["ALT", "AST", "ALP", "Bilirubin Total", "Bilirubin Direct", "Albumin", "Total Protein"], status: "waiting", date: "2026-02-12" },
    { id: "TR-005", healthId: "HID-1005", patientName: "Vikram Singh", testName: "HbA1c", tests: ["Glycated Hemoglobin"], status: "completed", date: "2026-02-12", result: "positive" },
    { id: "TR-006", healthId: "HID-1006", patientName: "Ananya Iyer", testName: "Vitamin D", tests: ["25-Hydroxy Vitamin D"], status: "new", date: "2026-02-13" },
    { id: "TR-007", healthId: "HID-1007", patientName: "Karan Gupta", testName: "Kidney Function", packageName: "Renal Panel", tests: ["Creatinine", "BUN", "Uric Acid", "eGFR", "Sodium", "Potassium"], status: "in-process", date: "2026-02-12" },
    { id: "TR-008", healthId: "HID-1008", patientName: "Meera Nair", testName: "Complete Blood Count", tests: ["WBC", "RBC", "Hemoglobin", "Platelet Count", "Hematocrit"], status: "completed", date: "2026-02-11", result: "negative" },
    { id: "TR-009", healthId: "HID-1001", patientName: "Arjun Mehta", testName: "Blood Sugar Fasting", tests: ["Fasting Glucose"], status: "waiting", date: "2026-02-11" },
    { id: "TR-010", healthId: "HID-1003", patientName: "Rohan Das", testName: "Full Body Checkup", packageName: "Platinum Health Package", tests: ["CBC", "Lipid Profile", "LFT", "KFT", "Thyroid Panel", "HbA1c", "Vitamin D", "Vitamin B12", "Iron Studies"], status: "new", date: "2026-02-13" },
];

export const archivedReports = [
    { id: "AR-001", healthId: "HID-1001", patientName: "Arjun Mehta", testName: "Complete Blood Count", uploadDate: "2026-02-13", fileName: "CBC_HID1001.pdf", smsNotified: true, emailNotified: true, status: "Completed" },
    { id: "AR-002", healthId: "HID-1005", patientName: "Vikram Singh", testName: "HbA1c", uploadDate: "2026-02-12", fileName: "HBA1C_HID1005.pdf", smsNotified: true, emailNotified: false, status: "Verified" },
    { id: "AR-003", healthId: "HID-1008", patientName: "Meera Nair", testName: "Complete Blood Count", uploadDate: "2026-02-11", fileName: "CBC_HID1008.pdf", smsNotified: false, emailNotified: true, status: "Pending Review" },
    { id: "AR-004", healthId: "HID-1002", patientName: "Priya Sharma", testName: "Lipid Profile", uploadDate: "2026-01-20", fileName: "LIPID_HID1002.pdf", smsNotified: true, emailNotified: true, status: "Completed" },
    { id: "AR-005", healthId: "HID-1004", patientName: "Sneha Patel", testName: "Thyroid Panel", uploadDate: "2026-01-15", fileName: "THYROID_HID1004.pdf", smsNotified: false, emailNotified: false, status: "Completed" },
];

export const analyticsData = {
    frequentTests: [
        { name: "Complete Blood Count", count: 342 },
        { name: "Blood Sugar Fasting", count: 289 },
        { name: "Lipid Profile", count: 256 },
        { name: "Thyroid Panel", count: 198 },
        { name: "HbA1c", count: 187 },
        { name: "Vitamin D", count: 176 },
        { name: "Liver Function Test", count: 154 },
        { name: "Kidney Function Test", count: 132 },
    ],
    frequentPackages: [
        { name: "Full Body Checkup", count: 210 },
        { name: "Thyroid Complete", count: 156 },
        { name: "Diabetes Care", count: 143 },
        { name: "Hepatic Panel", count: 112 },
        { name: "Renal Panel", count: 98 },
        { name: "Cardiac Risk Panel", count: 87 },
    ],
    frequentPositives: [
        { name: "Vitamin D Deficiency", count: 289, severity: "moderate" },
        { name: "Elevated Blood Sugar", count: 234, severity: "high" },
        { name: "High Cholesterol", count: 198, severity: "moderate" },
        { name: "Low Hemoglobin", count: 176, severity: "moderate" },
        { name: "Thyroid Dysfunction", count: 145, severity: "high" },
        { name: "Elevated Creatinine", count: 112, severity: "high" },
    ],
};
