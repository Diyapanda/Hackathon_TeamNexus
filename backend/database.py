import os
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager

from dotenv import load_dotenv
load_dotenv()

# Get DB URL from env or use default
DATABASE_URL = os.getenv("DATABASE_URL")

# Create a threaded connection pool
connection_pool = None
try:
    connection_pool = psycopg2.pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=20,
        dsn=DATABASE_URL
    )
    print("Database connection pool created successfully")
except (Exception, psycopg2.DatabaseError) as error:
    print("Error while connecting to PostgreSQL", error)

@contextmanager
def get_db_connection():
    """
    Context manager to get a connection from the pool.
    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(...)
    """
    conn = None
    try:
        conn = connection_pool.getconn()
        yield conn
    finally:
        if conn:
            connection_pool.putconn(conn)

# For dependency injection in FastAPI
def get_db():
    conn = None
    try:
        conn = connection_pool.getconn()
        yield conn
    finally:
        if conn:
            connection_pool.putconn(conn)
