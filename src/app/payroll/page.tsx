'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { CreditCard, Download, Eye, Loader2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PayrollPage() {
  const { profile, loading: authLoading } = useAuth();
  const [paystubs, setPaystubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'hr';

  useEffect(() => {
    if (!authLoading && profile) {
      fetchPayroll();
    }
  }, [authLoading, profile]);

  async function fetchPayroll() {
    try {
      setLoading(true);
      let query = supabase
        .from('payroll')
        .select('*, profile:profiles(full_name, email)')
        .order('period_end', { ascending: false });

      // Regular employees only see their own records
      if (!isAdmin) {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPaystubs(data || []);
    } catch (err: any) {
      console.error('Fetch Payroll Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || (loading && paystubs.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const totalPayroll = paystubs.reduce((acc, p) => acc + (p.net_pay || 0), 0);

  return (
    <div className="animate-fade-in relative pb-20">
      <Header title="Payroll" />

      {/* Summary Card */}
      <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 mb-10 overflow-hidden relative group">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
              <CreditCard className="text-primary" size={40} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{isAdmin ? 'Total Monthly Payroll' : 'My Total Earnings'}</p>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">${totalPayroll.toLocaleString()}</h2>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
              <Download size={18} /> Export
            </button>
            {isAdmin && (
              <button className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95">
                Run Payroll
              </button>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32 group-hover:translate-x-24 transition-transform duration-1000"></div>
      </div>

      {/* Main Listing */}
      <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{isAdmin ? 'Organization Payroll' : 'My Salary Statements'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                <th className="px-8 py-5">{isAdmin ? 'Employee' : 'Pay Period'}</th>
                {isAdmin && <th className="px-8 py-5">Period</th>}
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paystubs.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6 font-bold text-slate-900">
                    {isAdmin ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] uppercase">{p.profile?.full_name?.charAt(0)}</div>
                        <span>{p.profile?.full_name}</span>
                      </div>
                    ) : (
                      `${new Date(p.period_start).toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${new Date(p.period_end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                      {new Date(p.period_start).toLocaleDateString([], { month: 'short' })} {new Date(p.period_start).getFullYear()}
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900">${p.net_pay?.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">Net Pay</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><Eye size={18} /></button>
                       <button className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-all"><Download size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paystubs.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="text-slate-200" size={48} />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Records Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
