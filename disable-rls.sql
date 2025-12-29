-- Disable Row Level Security (RLS) on pastes table
-- This is needed because we're using service_role key on the server
ALTER TABLE pastes DISABLE ROW LEVEL SECURITY;
