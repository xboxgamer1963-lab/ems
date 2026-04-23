'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Calendar,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarDays,
  Stethoscope,
  Clock,
  Plus
} from 'lucide-react';

export default function ApplyLeavePage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const balances = [
    { label: 'ANNUAL', balance: profile?.annual_leave_balance || 14, icon: CalendarDays, color: 'bg-primary/10 text-primary' },
    { label: 'SICK', balance: profile?.sick_leave_balance || 8, icon: Stethoscope, color: 'bg-[#ffdbcb] text-[#95491c]' },
    { label: 'PENDING', balance: 2, icon: Clock, color: 'bg-[#d4e6e6] text-[#516162]' }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Check balance
      let currentBalance = 0;
      let balanceField = '';
      if (formData.leave_type === 'annual') {
        currentBalance = profile.annual_leave_balance || 14;
        balanceField = 'annual_leave_balance';
      } else if (formData.leave_type === 'sick') {
        currentBalance = profile.sick_leave_balance || 8;
        balanceField = 'sick_leave_balance';
      } else if (formData.leave_type === 'personal') {
        currentBalance = profile.personal_leave_balance || 5;
        balanceField = 'personal_leave_balance';
      }

      if (currentBalance < diffDays && balanceField) {
        alert('Insufficient leave balance!');
        setLoading(false);
        return;
      }

      // 1. Save to DB
      const { error: leaveError } = await supabase.from('leaves').insert({
        user_id: profile.id,
        organization_id: profile.organization_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        status: 'pending'
      });

      if (leaveError) throw leaveError;

      // 2. Update Quota (as requested by user)
      if (balanceField) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ [balanceField]: currentBalance - diffDays })
          .eq('id', profile.id);

        if (profileError) throw profileError;
      }

      alert('Leave request submitted successfully!');
      router.push('/leaves');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in relative pb-20">
      <Header title="Apply for Leave" />

      <div className="max-w-4xl mx-auto space-y-10 mt-10">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-2 px-1">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>My Leaves</span>
            <ChevronRight size={12} />
            <span className="text-primary">Apply for Leave</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Apply for Leave</h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">Submit your leave request for review. Ensure all details are accurate to expedite the approval process by your department manager.</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {balances.map((b) => (
            <div key={b.label} className="bg-white p-6 rounded-3xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-slate-50">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-2.5 ${b.color} rounded-2xl`}>
                  <b.icon size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.label}</span>
              </div>
              <p className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{b.balance.toString().padStart(2, '0')}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Days Available</p>
            </div>
          ))}
        </div>

        {/* Main Form */}
        <div className="bg-white p-10 rounded-[40px] shadow-[0px_4px_30px_rgba(0,0,0,0.03)] border border-slate-50">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Leave Type */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900">Leave Type</label>
                <div className="relative">
                  <select
                    required
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    className="w-full appearance-none bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  >
                    <option value="" disabled>Select leave type</option>
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="maternity">Maternity/Paternity</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="hidden md:flex items-center">
                <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                  <Info className="text-primary shrink-0" size={24} />
                  <p className="text-[11px] font-bold text-primary-container leading-relaxed">Medical certificate required for sick leave exceeding 2 consecutive days.</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900">Start Date</label>
                <div className="relative">
                  <input
                    type="date" required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                  <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-900">End Date</label>
                <div className="relative">
                  <input
                    type="date" required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                  <CheckCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-900">Reason for Leave</label>
              <textarea
                required
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly explain the reason for your leave request..."
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
              />
            </div>

            {/* Upload */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-900">Attachments (Optional)</p>
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Plus size={32} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Click to upload or drag and drop</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">PDF, PNG, JPG (max. 10MB)</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-50">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 rounded-xl font-black text-xs text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Guidance */}
        <div className="bg-primary/5 p-8 rounded-3xl flex items-start gap-6 border border-primary/10">
          <AlertCircle className="text-primary shrink-0" size={24} />
          <div>
            <p className="text-xs font-black text-primary uppercase tracking-widest">Pro Tip</p>
            <p className="text-[11px] font-bold text-primary-container/80 mt-1.5 leading-relaxed">Submit your annual leave at least 2 weeks in advance to ensure your tasks can be properly covered by the team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
