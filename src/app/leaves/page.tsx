'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { Calendar, Plus, Check, X, Loader2, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LeavesPage() {
  const { profile, loading: authLoading } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isHR = profile?.role === 'hr';

  const [formData, setFormData] = useState({
    type: 'Vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    if (!authLoading) {
      fetchLeaves();
    }
  }, [authLoading, profile]);

  async function fetchLeaves() {
    setLoading(true);
    let query = supabase
      .from('leaves')
      .select('*, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (profile?.role === 'employee') {
      query = query.eq('user_id', profile.id);
    }

    const { data, error } = await query;
    if (!error) setLeaves(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    const { error } = await supabase.from('leaves').insert({
      user_id: profile.id,
      organization_id: profile.organization_id,
      leave_type: formData.type,
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      status: 'pending'
    });

    if (!error) {
      setShowModal(false);
      setFormData({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    }
    setLoading(false);
  }

  async function handleUpdateStatus(id: string, status: 'approved' | 'rejected') {
    setActionLoading(id);
    const { error } = await supabase
      .from('leaves')
      .update({ status })
      .eq('id', id);

    if (!error) {
      fetchLeaves();
    }
    setActionLoading(null);
  }

  if (authLoading || loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center min-height-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      <Header title="Leaves" />

      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Leave Requests</h3>
        <Link href="/leaves/new" className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
          <Plus size={18} />
          Apply New Leave
        </Link>
      </div>

      <div className="flex flex-col gap-4 mb-12">
        {leaves.map((leave) => (
          <div key={leave.id} className="card p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Calendar className="text-primary" size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-lg text-slate-900">{leave.leave_type}</h4>
                    <span className={`badge ${
                      leave.status === 'approved' ? 'badge-success' : 
                      leave.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {leave.profile?.full_name} • {leave.start_date} to {leave.end_date}
                  </p>
                  {leave.reason && (
                    <p className="text-xs text-slate-400 mt-2 italic font-medium">"{leave.reason}"</p>
                  )}
                </div>
              </div>
              
              {(isAdmin || isHR) && leave.status === 'pending' ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(leave.id, 'approved')}
                    disabled={!!actionLoading}
                    className="p-3 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all shadow-sm"
                    title="Approve"
                  >
                    {actionLoading === leave.id ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                    disabled={!!actionLoading}
                    className="p-3 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all shadow-sm"
                    title="Reject"
                  >
                    {actionLoading === leave.id ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
                  </button>
                </div>
              ) : leave.status === 'approved' ? (
                <CheckCircle2 size={24} className="text-accent opacity-30" />
              ) : leave.status === 'rejected' ? (
                <XCircle size={24} className="text-error opacity-30" />
              ) : null}
            </div>
          </div>
        ))}
        {leaves.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">No Requests</p>
            <p className="text-slate-500 font-medium">No leave requests found for your organization.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl animate-fade-in overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold">Apply for Leave</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Leave Type</label>
                <select 
                  className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-semibold"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option>Vacation</option>
                  <option>Sick Leave</option>
                  <option>Personal Leave</option>
                  <option>Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">From</label>
                  <input 
                    type="date" required
                    className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">To</label>
                  <input 
                    type="date" required
                    className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Reason</label>
                <textarea 
                  rows={3} 
                  required
                  className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium resize-none"
                  placeholder="Why are you taking this leave?"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
