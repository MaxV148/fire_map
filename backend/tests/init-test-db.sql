-- Create fire_backend database
CREATE DATABASE fire_backend;

-- Connect to fire_backend database
\c fire_backend

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create fire_backend_test database
CREATE DATABASE fire_backend_test;

-- Connect to fire_backend_test database
\c fire_backend_test

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fire_backend TO root;
GRANT ALL PRIVILEGES ON DATABASE fire_backend_test TO root; 