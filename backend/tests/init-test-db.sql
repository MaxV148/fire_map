-- Create fire_backend database
CREATE DATABASE fire_backend WITH OWNER = root;

-- Connect to fire_backend database
\c fire_backend

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create fire_backend_test database
CREATE DATABASE fire_backend_test WITH OWNER = root;

-- Connect to fire_backend_test database
\c fire_backend_test

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Grant privileges
ALTER DATABASE fire_backend OWNER TO root;
ALTER DATABASE fire_backend_test OWNER TO root;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO root;
GRANT ALL ON ALL TABLES IN SCHEMA public TO root;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO root; 