from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import connection_pool
from routers import lab
import json
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount uploads directory
uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(uploads_path):
    os.makedirs(uploads_path)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

origins = os.getenv("ALLOWED_ORIGINS").split(",")
# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend running (Raw SQL)"}

@app.get("/api/lab/dashboard-stats")
def dashboard_stats():
    
    conn = connection_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM lab_test_orders WHERE status = 'ordered'")
            pending_count = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM lab_test_orders WHERE status = 'completed'")
            completed_count = cur.fetchone()[0]
            
            # Simple assumption for 'tests_today' - just all orders for now or filter by date in real app
            cur.execute("SELECT COUNT(*) FROM lab_test_orders")
            total_count = cur.fetchone()[0]

    finally:
        connection_pool.putconn(conn)

    return {
        "stats": [
            {"key": "tests_today", "label": "Tests Today", "value": total_count},
            {"key": "completed", "label": "Completed", "value": completed_count},
            {"key": "pending", "label": "Pending", "value": pending_count},
            {"key": "new_requests", "label": "New Requests", "value": pending_count},
        ],
        "recent_activity": [
            {"id": "RA-001", "text": "Activity 1", "status": "completed", "date": "2026-02-15"},
        ]
    }

# Routes
@app.get("/api/lab/orders")
def get_orders(status: str = None):
    conn = connection_pool.getconn()
    try:
        query = """
            SELECT t.id, t.status, t.ordered_at, v.name, v.patient_id
            FROM lab_test_orders t
            LEFT JOIN lab_order_patient_view v ON t.id = v.order_id
        """
        params = []
        if status:
            query += " WHERE t.status = %s"
            params.append(status)
        
        with conn.cursor() as cur:
            cur.execute(query, tuple(params))
            orders = cur.fetchall()
            
        # Convert tuples to dicts
        # order is (id, status, ordered_at, name, patient_id)
        return [
            {
                "id": str(o[0]),
                "status": o[1],
                "ordered_at": o[2].isoformat() if o[2] else None,
                "patientName": o[3] if o[3] else "Unknown Patient",
                "healthId": o[4] if o[4] else "N/A",
                "testName": "Diagnostic Test", 
                "testId": "T001"
            } for o in orders
        ]
    finally:
        connection_pool.putconn(conn)

@app.patch("/api/lab/orders/{order_id}/status")
def update_order_status(order_id: str, body: dict):
    return {"id": order_id, "status": body.get("status"), "message": "Status updated"}

@app.get("/api/tests/{test_id}/parameters")
def get_test_parameters(test_id: str):
    params_map = {
        "T001": [
            {"id": "wbc", "name": "WBC", "unit": "x10³/µL", "min": 4.5, "max": 11.0, "criticalMin": 2.0, "criticalMax": 30.0},
            {"id": "rbc", "name": "RBC", "unit": "x10⁶/µL", "min": 4.5, "max": 5.5, "criticalMin": 2.0, "criticalMax": 8.0},
            {"id": "hgb", "name": "Hemoglobin", "unit": "g/dL", "min": 12.0, "max": 17.5, "criticalMin": 7.0, "criticalMax": 20.0},
            {"id": "plt", "name": "Platelet Count", "unit": "x10³/µL", "min": 150, "max": 400, "criticalMin": 50, "criticalMax": 1000},
        ],
        "T002": [
            {"id": "tsh", "name": "TSH", "unit": "mIU/L", "min": 0.4, "max": 4.0, "criticalMin": 0.1, "criticalMax": 10.0},
            {"id": "t3", "name": "T3", "unit": "ng/dL", "min": 80, "max": 200, "criticalMin": 40, "criticalMax": 400},
            {"id": "t4", "name": "T4", "unit": "µg/dL", "min": 5.0, "max": 12.0, "criticalMin": 2.0, "criticalMax": 20.0},
        ],
        "T003": [
            {"id": "tc", "name": "Total Cholesterol", "unit": "mg/dL", "min": 0, "max": 200, "criticalMin": None, "criticalMax": 300},
            {"id": "hdl", "name": "HDL", "unit": "mg/dL", "min": 40, "max": 60, "criticalMin": None, "criticalMax": None},
            {"id": "ldl", "name": "LDL", "unit": "mg/dL", "min": 0, "max": 100, "criticalMin": None, "criticalMax": 190},
            {"id": "tg", "name": "Triglycerides", "unit": "mg/dL", "min": 0, "max": 150, "criticalMin": None, "criticalMax": 500},
        ],
        "T004": [
            {"id": "alt", "name": "ALT", "unit": "U/L", "min": 7, "max": 56, "criticalMin": None, "criticalMax": 200},
            {"id": "ast", "name": "AST", "unit": "U/L", "min": 10, "max": 40, "criticalMin": None, "criticalMax": 200},
            {"id": "alp", "name": "ALP", "unit": "U/L", "min": 44, "max": 147, "criticalMin": None, "criticalMax": 500},
        ],
        "T005": [
            {"id": "hba1c", "name": "Glycated Hemoglobin", "unit": "%", "min": 4.0, "max": 5.6, "criticalMin": None, "criticalMax": 14.0},
        ],
        "T006": [
            {"id": "vitd", "name": "25-Hydroxy Vitamin D", "unit": "ng/mL", "min": 30, "max": 100, "criticalMin": 10, "criticalMax": 150},
        ],
    }
    return params_map.get(test_id, [])

app.include_router(lab.router)



@app.get("/api/lab/analytics")
def get_analytics():
    return {
        "frequentTests": [
            {"name": "Complete Blood Count", "count": 342},
            {"name": "Blood Sugar Fasting", "count": 289},
            {"name": "Lipid Profile", "count": 256},
            {"name": "Thyroid Panel", "count": 198},
            {"name": "HbA1c", "count": 187},
            {"name": "Vitamin D", "count": 176},
            {"name": "Liver Function Test", "count": 154},
            {"name": "Kidney Function Test", "count": 132},
        ],
        "frequentPackages": [
            {"name": "Full Body Checkup", "count": 210},
            {"name": "Thyroid Complete", "count": 156},
            {"name": "Diabetes Care", "count": 143},
            {"name": "Hepatic Panel", "count": 112},
            {"name": "Renal Panel", "count": 98},
            {"name": "Cardiac Risk Panel", "count": 87},
        ],
        "frequentPositives": [
            {"name": "Vitamin D Deficiency", "count": 289, "severity": "moderate"},
            {"name": "Elevated Blood Sugar", "count": 234, "severity": "high"},
            {"name": "High Cholesterol", "count": 198, "severity": "moderate"},
            {"name": "Low Hemoglobin", "count": 176, "severity": "moderate"},
            {"name": "Thyroid Dysfunction", "count": 145, "severity": "high"},
            {"name": "Elevated Creatinine", "count": 112, "severity": "high"},
        ],
    }

lab_profile = {
    "labName": "MedCore Diagnostics",
    "registrationNo": "CERT-2024-MED-8741",
    "adminName": "Dr. Rajesh Kumar",
    "adminId": "ADM-001",
    "address": "42, Health Avenue, Sector 15, Bengaluru, Karnataka 560001",
    "phone1": "+91-80-2345-6789",
    "phone2": "+91-80-2345-6790",
    "logoUrl": None,
}

@app.get("/api/lab/profile")
def get_lab_profile():
    return lab_profile

@app.put("/api/lab/profile")
def update_lab_profile(body: dict):
    for key in ["labName", "adminName", "adminId", "address", "phone1", "phone2", "logoUrl"]:
        if key in body:
            lab_profile[key] = body[key]
    return lab_profile
