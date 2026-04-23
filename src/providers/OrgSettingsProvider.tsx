'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export interface OrgSettings {
  id?: string;
  organization_id: string;
  work_start_time: string;
  work_end_time: string;
  late_threshold_minutes: number;
  timezone: string;
  work_days: string[];
  currency: string;
  currency_symbol: string;
  pay_frequency: string;
  salary_display: string;
  annual_leave_quota: number;
  sick_leave_quota: number;
  personal_leave_quota: number;
  fiscal_year_start: string;
  date_format: string;
  company_name: string | null;
  company_logo_url: string | null;
  updated_at?: string;
}

const DEFAULT_SETTINGS: Omit<OrgSettings, 'organization_id'> = {
  work_start_time: '09:00',
  work_end_time: '17:00',
  late_threshold_minutes: 15,
  timezone: 'UTC',
  work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  currency: 'USD',
  currency_symbol: '$',
  pay_frequency: 'monthly',
  salary_display: 'annual',
  annual_leave_quota: 14,
  sick_leave_quota: 8,
  personal_leave_quota: 5,
  fiscal_year_start: 'January',
  date_format: 'MM/DD/YYYY',
  company_name: null,
  company_logo_url: null,
};

interface OrgSettingsContextType {
  settings: OrgSettings | null;
  loading: boolean;
  saveSettings: (updates: Partial<OrgSettings>) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

const OrgSettingsContext = createContext<OrgSettingsContextType>({
  settings: null,
  loading: true,
  saveSettings: async () => ({ success: false }),
  refetch: async () => {},
});

export function OrgSettingsProvider({ children }: { children: React.ReactNode }) {
  const { profile, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const orgId = profile?.organization_id;

  const fetchSettings = useCallback(async () => {
    if (!orgId) return;
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', orgId)
        .maybeSingle();

      if (error) {
        console.error('OrgSettings fetch error:', error);
        // If table doesn't exist yet, use defaults silently
        setSettings({ ...DEFAULT_SETTINGS, organization_id: orgId });
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // No settings row yet — use defaults
        setSettings({ ...DEFAULT_SETTINGS, organization_id: orgId });
      }
    } catch (err) {
      console.error('OrgSettings exception:', err);
      setSettings({ ...DEFAULT_SETTINGS, organization_id: orgId });
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!authLoading && orgId) {
      fetchSettings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, orgId, fetchSettings]);

  const saveSettings = async (updates: Partial<OrgSettings>): Promise<{ success: boolean; error?: string }> => {
    if (!orgId) return { success: false, error: 'No organization' };

    try {
      const payload = { ...updates, organization_id: orgId };

      if (settings?.id) {
        // Update existing
        const { error } = await supabase
          .from('organization_settings')
          .update(payload)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('organization_settings')
          .upsert(payload, { onConflict: 'organization_id' })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSettings(data);
          return { success: true };
        }
      }

      await fetchSettings();
      return { success: true };
    } catch (err: any) {
      console.error('OrgSettings save error:', err);
      return { success: false, error: err.message || 'Failed to save' };
    }
  };

  return (
    <OrgSettingsContext.Provider value={{ settings, loading, saveSettings, refetch: fetchSettings }}>
      {children}
    </OrgSettingsContext.Provider>
  );
}

export const useOrgSettings = () => useContext(OrgSettingsContext);
