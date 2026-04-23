'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import {
  ShieldCheck, FileText, History, AlertCircle,
  CheckCircle2, Download, Search, Filter,
  Loader2, Lock, Eye, Terminal, Info,
  ShieldAlert, Fingerprint, Activity
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function CompliancePage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audit' | 'checklist' | 'security'>('audit');
  const [logs, setLogs] = useState<any[]>([]);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (profile?.organization_id && isAdmin) {
      fetchLogs();
    }
  }, [profile?.organization_id]);

  async function fetchLogs() {
    setLoading(true);
    // For demo, we'll fetch some data to simulate audit logs
    // In a real app, this would query a dedicated audit_logs table
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role, updated_at')
      .eq('organization_id', profile?.organization_id)
      .order('updated_at', { ascending: false });

    if (data) {
      setLogs(data.map(d => ({
        id: Math.random().toString(),
        user: d.full_name,
        action: 'Updated Profile Information',
        timestamp: d.updated_at,
        severity: 'info'
      })));
    }
    setLoading(false);
  }

  if (!isAdmin) {
    return (
      <div className="animate-fade-in">
        <Header title="Compliance" />
        <div className="flex flex-col items-center justify-center py-32">
          <ShieldAlert size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Access Denied</p>
          <p className="text-slate-500 font-medium mt-2">Compliance and Audit logs are restricted to System Administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <Header title="Compliance & Audit" />

      {/* Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Trust & Security</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" /> ISO 27001 & GDPR Compliant Infrastructure
          </p>
        </div>
        <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2 hover:-translate-y-1 transition-all active:scale-95">
          <Download size={18} /> Download Audit PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 mb-10 w-fit">
        {[
          { id: 'audit', label: 'Audit Logs', icon: Terminal },
          { id: 'checklist', label: 'Compliance Checklist', icon: CheckCircle2 },
          { id: 'security', label: 'System Security', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === 'audit' && (
            <div className="bg-white rounded-[2.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Filter by user or action..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none transition-all"
                  />
                </div>
                <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"><Filter size={18} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5">User</th>
                      <th className="px-8 py-5">Action</th>
                      <th className="px-8 py-5">Severity</th>
                      <th className="px-8 py-5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-slate-500 tabular-nums">{new Date(log.timestamp).toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{log.user.charAt(0)}</div>
                            <span className="text-sm font-black text-slate-900 tracking-tight">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-medium text-slate-600">{log.action}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest">{log.severity}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="text-slate-400 hover:text-primary transition-all"><Eye size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Quarterly Checklist</h3>
                <div className="space-y-6">
                  {[
                    { title: 'User Access Review', desc: 'Verify all active employee accounts.', done: true },
                    { title: 'Payroll Audit', desc: 'Ensure all gross pay calculations match salaries.', done: true },
                    { title: 'Data Encryption Check', desc: 'Verify RLS policies for all new tables.', done: false },
                    { title: 'GDPR Compliance', desc: 'Review data retention and deletion policies.', done: false },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                      <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${item.done ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-200 text-transparent'}`}>
                        <CheckCircle2 size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.title}</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-emerald-500 p-10 rounded-[3rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 -mr-8 -mb-8 rounded-full" />
                  <h4 className="text-3xl font-black tracking-tight mb-2">94% Compliant</h4>
                  <p className="text-emerald-50 font-medium leading-relaxed mb-6">Your organization is currently at low risk. Maintain this by completing the remaining 2 tasks.</p>
                  <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">View Detailed Score</button>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <AlertCircle size={24} />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Pending Certification</h4>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">Your HIPAA self-assessment is due in 15 days. Please ensure all medical data is handled correctly.</p>
                  {/* <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Start Assessment <ChevronRight size={14} /></button> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <SecurityCard icon={Fingerprint} label="MFA Adoption" value="100%" color="text-emerald-500" />
              <SecurityCard icon={Activity} label="System Health" value="Stable" color="text-emerald-500" />
              <SecurityCard icon={History} label="Data Backups" value="Daily" color="text-primary" />
              <SecurityCard icon={ShieldAlert} label="Threat Alerts" value="0 Active" color="text-slate-400" />

              <div className="col-span-1 md:col-span-4 bg-slate-900 p-12 rounded-[3rem] text-white overflow-hidden relative group">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,#3b82f6,transparent)]" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-foreground border border-white/10">Enterprise Security</div>
                    <h3 className="text-4xl font-black tracking-tight leading-none">Military-Grade Data Encryption</h3>
                    <p className="text-slate-400 font-medium leading-relaxed">All employee data, payroll records, and personal information are encrypted at rest and in transit using AES-256 and SSL/TLS protocols.</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-700">
                      <Lock size={40} className="text-primary" />
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">View Security Whitepaper</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SecurityCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
