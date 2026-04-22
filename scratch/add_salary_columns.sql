-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Adds compensation + job detail columns to the profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS salary        NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS department    TEXT,
  ADD COLUMN IF NOT EXISTS position      TEXT,
  ADD COLUMN IF NOT EXISTS start_date    DATE;
