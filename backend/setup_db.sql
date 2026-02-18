-- Script to create the database and user
-- Run this command in your terminal: psql -U postgres -f backend/setup_db.sql

-- 1. Create the Database
DROP DATABASE IF EXISTS mediguard;
CREATE DATABASE mediguard;

-- 2. Create the User (if not exists)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'mediguard_user') THEN

      CREATE ROLE mediguard_user WITH LOGIN PASSWORD 'mediguard_pass';
   END IF;
END
$do$;

-- 3. Grant Privileges
GRANT ALL PRIVILEGES ON DATABASE mediguard TO mediguard_user;
ALTER DATABASE mediguard OWNER TO mediguard_user;
