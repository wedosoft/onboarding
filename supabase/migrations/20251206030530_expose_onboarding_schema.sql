-- Expose onboarding schema to PostgREST API
-- This allows the schema to be accessible via Supabase client

-- Grant usage on schema to anon and authenticated roles
GRANT USAGE ON SCHEMA onboarding TO anon, authenticated, service_role;

-- Grant permissions on all tables in onboarding schema
GRANT SELECT ON ALL TABLES IN SCHEMA onboarding TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA onboarding TO authenticated, service_role;

-- Grant permissions on all sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA onboarding TO authenticated, service_role;

-- Grant permissions on all functions in onboarding schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA onboarding TO anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA onboarding
GRANT SELECT ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA onboarding
GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA onboarding
GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA onboarding
GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- Note: To expose the schema to PostgREST API, you need to add 'onboarding'
-- to the exposed schemas in Supabase Dashboard:
-- Settings > API > Exposed schemas > Add 'onboarding'
