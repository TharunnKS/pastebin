-- Supabase Database Schema for Pastebin Lite
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NULL,
  remaining_views INTEGER NULL CHECK (remaining_views IS NULL OR remaining_views >= 0)
);

-- Create index for faster queries on expired pastes
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at) WHERE expires_at IS NOT NULL;

-- Create index for paste lookups
CREATE INDEX IF NOT EXISTS idx_pastes_id ON pastes(id);
