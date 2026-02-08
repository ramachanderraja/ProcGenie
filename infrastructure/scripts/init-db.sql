-- =============================================================================
-- ProcGenie S2P Platform - PostgreSQL Initialization
-- =============================================================================
-- This script runs automatically when the PostgreSQL container starts
-- for the first time (via docker-entrypoint-initdb.d).
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the application schema
CREATE SCHEMA IF NOT EXISTS procgenie;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE procgenie_dev TO procgenie;
GRANT ALL PRIVILEGES ON SCHEMA procgenie TO procgenie;
GRANT ALL PRIVILEGES ON SCHEMA public TO procgenie;
ALTER DEFAULT PRIVILEGES IN SCHEMA procgenie GRANT ALL ON TABLES TO procgenie;
ALTER DEFAULT PRIVILEGES IN SCHEMA procgenie GRANT ALL ON SEQUENCES TO procgenie;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO procgenie;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO procgenie;

-- Set default search path
ALTER DATABASE procgenie_dev SET search_path TO procgenie, public;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'ProcGenie database initialization complete.';
END
$$;
