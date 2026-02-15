from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from database import connection_pool
from services.report_generator import generate_report_data
import json
import uuid
import os
import shutil

router = APIRouter(prefix="/api/lab", tags=["lab"])

# Ensure uploads directory exists
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.post("/reports")
async def upload_report(
    order_id: str = Form(...),
    parameters: str = Form(...),
    lab_id: str = Form(None),
    notify_sms: bool = Form(False),
    notify_email: bool = Form(False),
    file: UploadFile = File(None),
):
    # Get a connection from the pool
    if not connection_pool:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    conn = connection_pool.getconn()
    try:


        # Check security (isolation)
        secure_data = generate_report_data(conn, order_id, lab_id)
        
        # Use database lab_id if form lab_id is missing
        db_lab_id = secure_data.get("lab_id")
        final_lab_id = lab_id or db_lab_id

        # Insert report
        new_report_id = str(uuid.uuid4())
        parameters_json = json.dumps(json.loads(parameters)) 
        
        # Save file if provided
        file_path = None
        if file:
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(UPLOADS_DIR, unique_filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            # Store relative path or URL
            file_path = f"/uploads/{unique_filename}"
        
        patient_id = secure_data.get("patient_id")

        print(f"DEBUG: Inserting report for order={order_id}, lab={final_lab_id}, patient={patient_id}, file={file_path}")

        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO lab_reports (id, lab_test_order_id, report_data, status, created_at, lab_id, patient_id, attachment_url)
                VALUES (%s, %s, %s, 'completed', NOW(), %s, %s, %s)
            """, (new_report_id, order_id, parameters_json, final_lab_id, patient_id, file_path))
            
            # Update order status to completed
            cur.execute("""
                UPDATE lab_test_orders 
                SET status = 'completed' 
                WHERE id = %s
            """, (order_id,))
            
            conn.commit()
            print(f"Successfully uploaded report {new_report_id} for order {order_id}")

        return {
            "message": "Report uploaded successfully",
            "id": new_report_id,
            "secure_data": secure_data
        }
    except HTTPException as he:
        conn.rollback()
        raise he
    except Exception as e:
        conn.rollback()
        import traceback

        
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        connection_pool.putconn(conn)

@router.get("/reports")
def get_reports(range: str = "30days"):
    conn = connection_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    r.id,
                    r.lab_test_order_id,
                    r.created_at,
                    r.status,
                    r.sms_notified,
                    r.email_notified,
                    r.result_flag,
                    r.attachment_url,
                    v.name,
                    v.patient_id,
                    t.test_id
                FROM lab_reports r
                JOIN lab_test_orders t ON r.lab_test_order_id = t.id
                LEFT JOIN lab_order_patient_view v ON t.id = v.order_id
                ORDER BY r.created_at DESC
            """)
            rows = cur.fetchall()

        reports = []
        for row in rows:
            reports.append({
                "id": str(row[0]),
                "testName": row[10] or "Lab Test", 
                "patientName": row[8] or "Unknown",
                "healthId": row[9] or "N/A",
                "uploadDate": row[2].strftime("%Y-%m-%d") if row[2] else "N/A",
                "status": row[3].title() if row[3] else "Completed", 
                "result_flag": row[6],
                "smsNotified": row[4],
                "emailNotified": row[5],
                "downloadUrl": row[7]
            })
        return reports
    except Exception as e:
        print(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        connection_pool.putconn(conn)
