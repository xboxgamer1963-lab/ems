-- CLEAN SLATE EXTENDED FEATURES MIGRATION
-- This version drops the temporary tables first to ensure a clean schema with all required columns.

-- Drop existing tables to ensure clean re-creation (ONLY for these new feature tables)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS performance_reviews CASCADE;
DROP TABLE IF EXISTS kpis CASCADE;

-- 1. Performance Management
CREATE TABLE kpis (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  target_value    NUMERIC,
  unit            TEXT DEFAULT '%',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE performance_reviews (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cycle_name      TEXT NOT NULL,
  scores          JSONB DEFAULT '{}',
  feedback        TEXT,
  strengths       TEXT,
  growth_areas    TEXT,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'published')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. Recruitment & ATS
CREATE TABLE job_postings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  department      TEXT,
  location        TEXT,
  job_type        TEXT DEFAULT 'full-time',
  description     TEXT,
  requirements    TEXT,
  salary_range    TEXT,
  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE candidates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id          UUID REFERENCES job_postings(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  resume_url      TEXT,
  stage           TEXT DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  rating          INT DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. Shift Scheduling
CREATE TABLE shifts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  label           TEXT,
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 4. Notifications
CREATE TABLE notifications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  notif_type      TEXT DEFAULT 'info',
  is_read         BOOLEAN DEFAULT false,
  link            TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Admins/HR
CREATE POLICY "Admins manage kpis" ON kpis FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'hr')));
CREATE POLICY "Admins manage reviews" ON performance_reviews FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'hr')));
CREATE POLICY "Admins manage jobs" ON job_postings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'hr')));
CREATE POLICY "Admins manage candidates" ON candidates FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'hr')));
CREATE POLICY "Admins manage shifts" ON shifts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'hr')));

-- Policies for Employees
CREATE POLICY "Employees view kpis" ON kpis FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Employees view reviews" ON performance_reviews FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Employees view shifts" ON shifts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Employees view notifications" ON notifications FOR ALL USING (user_id = auth.uid());
