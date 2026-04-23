-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Creates the organization_settings table for org-wide configuration

CREATE TABLE IF NOT EXISTS organization_settings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Company Timings
  work_start_time   TIME NOT NULL DEFAULT '09:00',
  work_end_time     TIME NOT NULL DEFAULT '17:00',
  late_threshold_minutes INTEGER NOT NULL DEFAULT 15,  -- minutes after start time to mark as 'late'
  timezone          TEXT NOT NULL DEFAULT 'UTC',
  work_days         TEXT[] NOT NULL DEFAULT '{Monday,Tuesday,Wednesday,Thursday,Friday}',

  -- Payroll
  currency          TEXT NOT NULL DEFAULT 'USD',
  currency_symbol   TEXT NOT NULL DEFAULT '$',
  pay_frequency     TEXT NOT NULL DEFAULT 'monthly' CHECK (pay_frequency IN ('weekly', 'biweekly', 'monthly', 'annually')),
  salary_display    TEXT NOT NULL DEFAULT 'annual' CHECK (salary_display IN ('annual', 'monthly')),

  -- Leave Policy
  annual_leave_quota   INTEGER NOT NULL DEFAULT 14,
  sick_leave_quota     INTEGER NOT NULL DEFAULT 8,
  personal_leave_quota INTEGER NOT NULL DEFAULT 5,

  -- General
  fiscal_year_start  TEXT NOT NULL DEFAULT 'January',
  date_format        TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
  company_name       TEXT,
  company_logo_url   TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_org_settings UNIQUE (organization_id)
);

-- Enable RLS
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read and write their own org settings
CREATE POLICY "Admins can manage org settings"
  ON organization_settings
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: All org members can read settings
CREATE POLICY "Org members can read settings"
  ON organization_settings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_org_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_org_settings_timestamp
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_org_settings_timestamp();
