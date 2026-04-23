'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from "@/components/Header";
import { 
  CreditCard, 
  Download, 
  Eye, 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  Search,
  X,
  History,
  Zap,
  ChevronRight,
  Users
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useOrgSettings } from '@/providers/OrgSettingsProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Tab = 'history' | 'run';

export default function PayrollPage() {
  const { profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useOrgSettings();
  const [paystubs, setPaystubs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; count: number } | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'hr';
  const currencySymbol = settings?.currency_symbol || '$';

  useEffect(() => {
    if (!authLoading && profile) {
      fetchAllData();
    }
  }, [authLoading, profile]);

  async function fetchAllData() {
    try {
      setLoading(true);
      setErrorStatus(null);
      await Promise.all([fetchPayroll(), fetchEmployees()]);
    } catch (err: any) {
      setErrorStatus(`Critical loading error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPayroll() {
    if (!profile?.organization_id) return;
    
    let query = supabase
      .from('payroll')
      .select('*, profile:profiles(full_name, email, department)')
      .order('period_end', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', profile?.id);
    } else {
      query = query.eq('organization_id', profile?.organization_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    setPaystubs(data || []);
  }

  async function fetchEmployees() {
    if (!isAdmin || !profile?.organization_id) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', profile?.organization_id)
      .neq('role', 'admin');
    
    if (error) throw error;
    setEmployees(data || []);
  }

  const runPayroll = async (emp: any) => {
    if (!emp.salary) {
      setErrorStatus(`Cannot process ${emp.full_name}: Salary missing.`);
      return;
    }

    if (!profile?.organization_id) {
      setErrorStatus("Organization context missing. Please refresh.");
      return;
    }

    try {
      setProcessing(emp.id);
      setErrorStatus(null);
      
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      const monthlyPay = Math.round(Number(emp.salary) / 12);

      const { error } = await supabase
        .from('payroll')
        .insert({
          user_id: emp.id,
          organization_id: profile.organization_id,
          period_start: firstDay,
          period_end: lastDay,
          payment_date: now.toISOString(),
          gross_pay: monthlyPay,
          net_pay: monthlyPay,
          deductions: 0,
          status: 'paid',
        });

      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchPayroll();
    } catch (err: any) {
      console.error('Run Payroll Error:', err);
      setErrorStatus(`Failed: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRunAllClick = () => {
    const readyCount = filteredEmployees.filter(e => !!e.salary).length;
    if (readyCount === 0) {
      setErrorStatus("No employees have salaries set. Visit Directory to set them.");
      return;
    }
    setConfirmModal({ show: true, count: readyCount });
  };

  const executeBatchPayroll = async () => {
    const readyEmployees = filteredEmployees.filter(e => !!e.salary);
    setConfirmModal(null);
    setProcessing('all');
    setErrorStatus(null);
    
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const batch = readyEmployees.map(emp => {
        const monthlyPay = Math.round(Number(emp.salary) / 12);
        return {
          user_id: emp.id,
          organization_id: profile.organization_id,
          period_start: firstDay,
          period_end: lastDay,
          payment_date: now.toISOString(),
          gross_pay: monthlyPay,
          net_pay: monthlyPay,
          deductions: 0,
          status: 'paid',
        };
      });

      const { error } = await supabase.from('payroll').insert(batch);
      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      await fetchPayroll();
    } catch (err: any) {
      console.error('Batch Error:', err);
      setErrorStatus(`Batch Failed: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const totalPayrollValue = paystubs.reduce((acc, p) => acc + (p.net_pay || 0), 0);

  if (authLoading || (loading && paystubs.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative pb-20">
      <Header title="Payroll" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <CreditCard className="text-primary" size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Distributed</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{currencySymbol}{totalPayrollValue.toLocaleString()}</h3>
          </div>
          <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-16 group-hover:translate-x-12 transition-transform duration-1000"></div>
        </div>

        {isAdmin && (
          <>
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <TrendingUp className="text-emerald-600" size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Employees</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{employees.length}</h3>
              </div>
              <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/5 -skew-x-12 translate-x-16 group-hover:translate-x-12 transition-transform duration-1000"></div>
            </div>

            <div className="bg-primary p-8 rounded-[2rem] shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                  <Zap className="text-white" size={24} />
                </div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Next Run Estimate</p>
                <h3 className="text-3xl font-black tracking-tight">
                  {currencySymbol}{Math.round(employees.reduce((s, e) => s + (Number(e.salary) / 12), 0)).toLocaleString()}
                </h3>
              </div>
              <div className="absolute top-0 right-0 w-32 h-full bg-white/10 -skew-x-12 translate-x-16 group-hover:translate-x-12 transition-transform duration-1000"></div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      {isAdmin && (
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-10 w-fit">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History size={16} /> History
          </button>
          <button
            onClick={() => setActiveTab('run')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'run' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Zap size={16} /> Run Payroll
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl max-w-md w-full border border-slate-100 scale-in">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 mx-auto">
              <Zap className="text-primary" size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center tracking-tight mb-2">Run Organization Payroll?</h3>
            <p className="text-slate-500 text-center font-medium leading-relaxed mb-8">
              You are about to process payroll for <span className="font-black text-slate-900">{confirmModal.count} employees</span>. 
              This will generate "Paid" records for the current month. This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                type="button"
                onClick={executeBatchPayroll}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
              >
                Yes, Process Payroll
              </button>
              <button 
                type="button"
                onClick={() => setConfirmModal(null)}
                className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notifications */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-3">
        {showSuccess && (
          <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={24} />
            <p className="font-black text-sm uppercase tracking-widest">Payroll Processed Successfully!</p>
          </div>
        )}
        {errorStatus && (
          <div className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in relative">
            <AlertCircle size={24} />
            <div className="pr-8">
              <p className="font-black text-sm uppercase tracking-widest leading-none mb-1">Process Error</p>
              <p className="text-[11px] opacity-90 font-medium leading-tight">{errorStatus}</p>
            </div>
            <button 
              type="button"
              onClick={() => setErrorStatus(null)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* RUN PAYROLL VIEW */}
      {isAdmin && activeTab === 'run' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-50 shadow-sm">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search employees or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <button 
              type="button"
              onClick={handleRunAllClick}
              disabled={processing === 'all' || filteredEmployees.length === 0}
              className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {processing === 'all' ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              Process All ({filteredEmployees.length})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="bg-white p-6 rounded-3xl border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl font-black group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    {emp.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight">{emp.full_name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.department || 'No Dept'} • {emp.position || 'Employee'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {emp.salary ? (
                        <>
                          <span className="text-xs font-bold text-slate-900">{currencySymbol}{Math.round(Number(emp.salary) / 12).toLocaleString()}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">/ Month</span>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-500 rounded-lg">
                          <AlertCircle size={10} />
                          <span className="text-[9px] font-black uppercase">Salary not set</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => runPayroll(emp)}
                  disabled={!!processing || !emp.salary}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90 disabled:opacity-30 ${
                    emp.salary ? 'bg-slate-50 text-slate-400 hover:bg-primary hover:text-white group-hover:shadow-lg' : 'bg-slate-50 text-slate-200'
                  }`}
                >
                  {processing === emp.id ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={24} />}
                </button>
              </div>
            ))}
            {filteredEmployees.length === 0 && (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Users size={48} className="mb-4 opacity-20" />
                <p className="font-black text-xs uppercase tracking-widest">No employees found matching criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {(activeTab === 'history' || !isAdmin) && (
        <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isAdmin ? 'Payment History' : 'My Paystubs'}
            </h3>
            <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Download All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                  <th className="px-8 py-5">Recipient</th>
                  <th className="px-8 py-5">Period</th>
                  <th className="px-8 py-5">Net Pay</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paystubs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center text-[10px] font-black uppercase border border-primary/10">
                          {(p.profile?.full_name || 'E').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">{p.profile?.full_name || 'Employee'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.profile?.department || 'Staff'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-600">
                        {new Date(p.period_start).toLocaleDateString([], { month: 'short', day: 'numeric' })} – {new Date(p.period_end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{currencySymbol}{p.net_pay?.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                        p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                         <button className="p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all" title="View Details"><Eye size={18} /></button>
                         <button className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-all" title="Download PDF"><Download size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paystubs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <History size={64} className="text-slate-200" />
                        <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">No payroll history found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
