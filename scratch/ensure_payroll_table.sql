-- Run this in your Supabase SQL Editor
-- Ensures the payroll table is properly structured for multi-tenancy and the new payroll engine

CREATE TABLE IF NOT EXISTS payroll (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  payment_date    TIMESTAMPTZ DEFAULT now(),
  
  gross_pay       NUMERIC(12, 2),
  deductions      NUMERIC(12, 2) DEFAULT 0,
  net_pay         NUMERIC(12, 2) NOT NULL,
  
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'void')),
  notes           TEXT,
  
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Admins can manage all payroll in their org
CREATE POLICY "Admins can manage payroll"
  ON payroll
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- HR can manage all payroll in their org
CREATE POLICY "HR can manage payroll"
  ON payroll
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'hr'
    )
  );

-- Employees can only see their own payroll
CREATE POLICY "Employees can view own payroll"
  ON payroll
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_payroll_org_id ON payroll(organization_id);
CREATE INDEX IF NOT EXISTS idx_payroll_user_id ON payroll(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(period_end);
