from fastapi import HTTPException


def generate_report_data(conn, order_id: str, lab_id: str = None):
    """
    Fetches order and patient data using raw SQL.
    conn: psycopg2 connection object
    """
    with conn.cursor() as cur:
        # Fetch the order
        # Dynamic query building for optional lab_id
        query = "SELECT id, lab_id, status FROM lab_test_orders WHERE id = %s"
        params = [order_id]
        
        if lab_id and lab_id != "undefined" and lab_id != "null":
            query += " AND lab_id = %s"
            params.append(lab_id)
            
        cur.execute(query, tuple(params))
        order = cur.fetchone()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # order is a tuple: (id, lab_id, status)
        order_uuid = order[0]
        order_lab_id = order[1]

        # Fetch patient data using the secure SQL view
        cur.execute("""
            SELECT name, age, gender, phone, patient_id
            FROM lab_order_patient_view
            WHERE order_id = %s
            AND lab_id = %s
        """, (order_uuid, order_lab_id))
        
        patient_data = cur.fetchone()

        if not patient_data:
            raise HTTPException(status_code=403, detail="Access denied")

        # patient_data is a tuple: (name, age, gender, phone, patient_id) - let's check order
        # SELECT name, age, gender, phone, patient_id -- wait, I need to check the query above!
        return {
            "order_id": str(order_uuid),
            "lab_id": str(order_lab_id) if order_lab_id else None,
            "patient_id": str(patient_data[4]) if len(patient_data) > 4 else None,
            "patient": {
                "name": patient_data[0],
                "age": patient_data[1],
                "gender": patient_data[2],
                "phone": patient_data[3]
            },
            "test_info": "Additional test data could be fetched here"
        }
