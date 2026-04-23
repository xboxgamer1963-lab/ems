'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/providers/AuthProvider';
import { useOrgSettings, OrgSettings } from '@/providers/OrgSettingsProvider';
import {
  Settings, Clock, CreditCard, Calendar, Globe, Building2,
  Save, Loader2, CheckCircle2, AlertCircle, ChevronDown, Shield
} from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Karachi', 'Asia/Kolkata',
  'Asia/Dubai', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland',
];

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type SectionKey = 'company' | 'timings' | 'payroll' | 'leaves' | 'regional';

export default function SettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, saveSettings } = useOrgSettings();
  const [form, setForm] = useState<Partial<OrgSettings>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('company');
  const [dirty, setDirty] = useState(false);

  const isAdmin = profile?.role === 'admin';

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
      setDirty(false);
    }
  }, [settings]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const updateField = <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const toggleWorkDay = (day: string) => {
    const current = form.work_days || [];
    const next = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    updateField('work_days', next);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveSettings(form);
    setSaving(false);
    if (result.success) {
      setToast({ type: 'success', message: 'Settings saved! Changes will reflect for all org members.' });
      setDirty(false);
    } else {
      setToast({ type: 'error', message: result.error || 'Failed to save settings.' });
    }
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="animate-fade-in">
        <Header title="Settings" />
        <div className="flex flex-col items-center justify-center py-32">
          <Shield size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Admin Only</p>
          <p className="text-slate-500 font-medium mt-2">Organization settings can only be managed by Admins.</p>
        </div>
      </div>
    );
  }

  const sections: { key: SectionKey; label: string; icon: any; desc: string }[] = [
    { key: 'company', label: 'Company', icon: Building2, desc: 'Organization details' },
    { key: 'timings', label: 'Work Hours', icon: Clock, desc: 'Schedules & attendance' },
    { key: 'payroll', label: 'Payroll', icon: CreditCard, desc: 'Currency & pay frequency' },
    { key: 'leaves', label: 'Leave Policy', icon: Calendar, desc: 'Quotas & balances' },
    { key: 'regional', label: 'Regional', icon: Globe, desc: 'Timezone & date format' },
  ];

  const selectedCurrency = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0];

  return (
    <div className="animate-fade-in pb-20">
      <Header title="Settings" />

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Organization Settings</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
            Configure company-wide preferences. Changes apply to all members.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 active:scale-95 ${
            dirty
              ? 'bg-primary text-white shadow-primary/20 hover:-translate-y-1'
              : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`mb-6 px-6 py-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{toast.message}</p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        {/* Section Nav */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 p-3 sticky top-8">
            {sections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                  activeSection === s.key
                    ? 'bg-primary/5 text-primary'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  activeSection === s.key ? 'bg-primary/10' : 'bg-slate-100'
                }`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">{s.label}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 p-10">

            {/* ── COMPANY ── */}
            {activeSection === 'company' && (
              <div className="space-y-8">
                <SectionHeader icon={Building2} title="Company Information" desc="Basic organization details visible across the platform." />
                <FieldGroup label="Company Name">
                  <input
                    type="text"
                    value={form.company_name || ''}
                    onChange={e => updateField('company_name', e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="settings-input"
                  />
                </FieldGroup>
                <FieldGroup label="Company Logo URL">
                  <input
                    type="url"
                    value={form.company_logo_url || ''}
                    onChange={e => updateField('company_logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="settings-input"
                  />
                  {form.company_logo_url && (
                    <div className="mt-4 w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={form.company_logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </FieldGroup>
              </div>
            )}

            {/* ── WORK HOURS ── */}
            {activeSection === 'timings' && (
              <div className="space-y-8">
                <SectionHeader icon={Clock} title="Work Hours & Attendance" desc="Define your company's work schedule and lateness policy." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldGroup label="Work Start Time">
                    <input
                      type="time"
                      value={form.work_start_time || '09:00'}
                      onChange={e => updateField('work_start_time', e.target.value)}
                      className="settings-input"
                    />
                  </FieldGroup>
                  <FieldGroup label="Work End Time">
                    <input
                      type="time"
                      value={form.work_end_time || '17:00'}
                      onChange={e => updateField('work_end_time', e.target.value)}
                      className="settings-input"
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label="Late Threshold (minutes after start time)">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={5}
                      value={form.late_threshold_minutes || 15}
                      onChange={e => updateField('late_threshold_minutes', parseInt(e.target.value))}
                      className="flex-1 accent-primary h-2"
                    />
                    <span className="text-lg font-black text-slate-900 tabular-nums w-16 text-center bg-slate-50 py-2 rounded-xl">
                      {form.late_threshold_minutes || 15}m
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                    Employees arriving more than {form.late_threshold_minutes || 15} minutes after {form.work_start_time || '09:00'} will be marked as "Late"
                  </p>
                </FieldGroup>
                <FieldGroup label="Working Days">
                  <div className="flex flex-wrap gap-2">
                    {ALL_DAYS.map(day => {
                      const active = (form.work_days || []).includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleWorkDay(day)}
                          className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            active
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>
              </div>
            )}

            {/* ── PAYROLL ── */}
            {activeSection === 'payroll' && (
              <div className="space-y-8">
                <SectionHeader icon={CreditCard} title="Payroll Configuration" desc="Set currency, pay frequency, and salary display preferences." />
                <FieldGroup label="Payroll Currency">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { updateField('currency', c.code); updateField('currency_symbol', c.symbol); }}
                        className={`p-4 rounded-xl text-left transition-all ${
                          form.currency === c.code
                            ? 'bg-primary/5 border-2 border-primary text-primary shadow-sm'
                            : 'bg-slate-50 border-2 border-transparent text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-lg font-black">{c.symbol}</span>
                        <p className="text-xs font-bold mt-1">{c.code}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{c.name}</p>
                      </button>
                    ))}
                  </div>
                </FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldGroup label="Pay Frequency">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'biweekly', label: 'Bi-Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'annually', label: 'Annually' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateField('pay_frequency', opt.value)}
                          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            form.pay_frequency === opt.value
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FieldGroup>
                  <FieldGroup label="Salary Display Mode">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'annual', label: 'Annual', desc: 'Show yearly salary' },
                        { value: 'monthly', label: 'Monthly', desc: 'Show monthly salary' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateField('salary_display', opt.value)}
                          className={`py-4 px-4 rounded-xl text-left transition-all ${
                            form.salary_display === opt.value
                              ? 'bg-primary/5 border-2 border-primary text-primary'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-2 border-transparent'
                          }`}
                        >
                          <p className="text-xs font-black uppercase tracking-widest">{opt.label}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </FieldGroup>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                  <p className="text-2xl font-black text-slate-900">
                    {selectedCurrency.symbol}24,000
                    <span className="text-sm font-bold text-slate-400 ml-2">
                      / {form.salary_display === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Paid {form.pay_frequency || 'monthly'} in {selectedCurrency.name} ({selectedCurrency.code})
                  </p>
                </div>
              </div>
            )}

            {/* ── LEAVE POLICY ── */}
            {activeSection === 'leaves' && (
              <div className="space-y-8">
                <SectionHeader icon={Calendar} title="Leave Policy" desc="Default leave quotas for new employees joining the organization." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <LeaveQuotaCard
                    label="Annual Leave"
                    value={form.annual_leave_quota || 14}
                    onChange={v => updateField('annual_leave_quota', v)}
                    color="bg-primary/10 text-primary"
                    desc="Vacation & holiday"
                  />
                  <LeaveQuotaCard
                    label="Sick Leave"
                    value={form.sick_leave_quota || 8}
                    onChange={v => updateField('sick_leave_quota', v)}
                    color="bg-red-50 text-red-600"
                    desc="Health & medical"
                  />
                  <LeaveQuotaCard
                    label="Personal Leave"
                    value={form.personal_leave_quota || 5}
                    onChange={v => updateField('personal_leave_quota', v)}
                    color="bg-amber-50 text-amber-600"
                    desc="Personal matters"
                  />
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Days Off Per Year</p>
                  <p className="text-3xl font-black text-slate-900">
                    {(form.annual_leave_quota || 14) + (form.sick_leave_quota || 8) + (form.personal_leave_quota || 5)} days
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-1">These quotas apply to newly added employees by default.</p>
                </div>
              </div>
            )}

            {/* ── REGIONAL ── */}
            {activeSection === 'regional' && (
              <div className="space-y-8">
                <SectionHeader icon={Globe} title="Regional Preferences" desc="Timezone, date format, and fiscal year configuration." />
                <FieldGroup label="Timezone">
                  <select
                    value={form.timezone || 'UTC'}
                    onChange={e => updateField('timezone', e.target.value)}
                    className="settings-input"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FieldGroup label="Date Format">
                    <div className="grid grid-cols-1 gap-2">
                      {DATE_FORMATS.map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => updateField('date_format', fmt)}
                          className={`py-3 px-5 rounded-xl text-sm font-bold text-left transition-all ${
                            form.date_format === fmt
                              ? 'bg-primary/5 border-2 border-primary text-primary'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-2 border-transparent'
                          }`}
                        >
                          {fmt}
                          <span className="text-[10px] font-bold text-slate-400 ml-3">
                            {fmt === 'MM/DD/YYYY' ? '04/23/2026' : fmt === 'DD/MM/YYYY' ? '23/04/2026' : '2026-04-23'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </FieldGroup>
                  <FieldGroup label="Fiscal Year Starts">
                    <select
                      value={form.fiscal_year_start || 'January'}
                      onChange={e => updateField('fiscal_year_start', e.target.value)}
                      className="settings-input"
                    >
                      {MONTHS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky save bar when dirty */}
      {dirty && (
        <div className="fixed bottom-0 left-64 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-10 py-4 flex items-center justify-between z-40" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <p className="text-sm font-bold text-slate-500">You have unsaved changes</p>
          <div className="flex gap-3">
            <button
              onClick={() => { if (settings) { setForm({ ...settings }); setDirty(false); } }}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-Components ── */

function SectionHeader({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</label>
      {children}
    </div>
  );
}

function LeaveQuotaCard({ label, value, onChange, color, desc }: { label: string; value: number; onChange: (v: number) => void; color: string; desc: string }) {
  return (
    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-center group hover:bg-primary/5 hover:border-primary/10 transition-all duration-300">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="flex items-center justify-center gap-3 mb-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-100 transition-all active:scale-95"
        >
          −
        </button>
        <span className="text-4xl font-black text-slate-900 tabular-nums w-16 text-center">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-lg hover:bg-slate-100 transition-all active:scale-95"
        >
          +
        </button>
      </div>
      <p className="text-[10px] font-bold text-slate-400">{desc}</p>
    </div>
  );
}
