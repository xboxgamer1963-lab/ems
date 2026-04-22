'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { CheckCircle2, Clock, Filter, Loader2, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function AttendancePage() {
  const { profile, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const isHR = profile?.role === 'hr';

  useEffect(() => {
    if (!authLoading) {
      fetchAttendance();
    }
  }, [authLoading, profile]);

  async function fetchAttendance() {
    setLoading(true);
    let query = supabase
      .from('attendance')
      .select('*, profile:profiles(full_name, email)')
      .order('date', { ascending: false });

    if (profile?.role === 'employee') {
      query = query.eq('user_id', profile.id);
    }

    const { data, error } = await query;
    if (!error) setData(data || []);
    setLoading(false);
  }

  async function handleAction(type: 'in' | 'out') {
    if (!profile) return;
    setActionLoading(true);
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (type === 'in') {
      const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
      await supabase.from('attendance').insert({
        user_id: profile.id,
        organization_id: profile.organization_id,
        date: today,
        check_in: now.toISOString(),
        status: isLate ? 'late' : 'present'
      });
    } else {
      // Find today's record to check out
      const { data: todayRec } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', profile.id)
        .eq('date', today)
        .single();

      if (todayRec) {
        await supabase.from('attendance')
          .update({ check_out: now.toISOString() })
          .eq('id', todayRec.id);
      }
    }
    
    await fetchAttendance();
    setActionLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-height-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const todayRecord = data.find(r => r.date === new Date().toISOString().split('T')[0] && r.user_id === profile?.id);

  return (
    <div className="animate-fade-in">
      <Header title="Attendance" />

      <div className="flex justify-between items-center mb-10">
        <div className="grid grid-cols-3 gap-6 flex-1 max-w-3xl">
          <div className="card">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Present</p>
            <h3 className="text-3xl font-black mt-2 text-slate-900">{data.filter(r => r.status === 'present').length}</h3>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Late Arrivals</p>
            <h3 className="text-3xl font-black mt-2 text-warning">{data.filter(r => r.status === 'late').length}</h3>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Absent</p>
            <h3 className="text-3xl font-black mt-2 text-error">{data.filter(r => r.status === 'absent').length}</h3>
          </div>
        </div>

        {/* Action Button for all users to check-in/out */}
        <div className="ml-8">
          {!todayRecord ? (
            <button 
              onClick={() => handleAction('in')} 
              disabled={actionLoading}
              className="btn btn-primary px-8 py-4 shadow-xl flex gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              Check In Today
            </button>
          ) : !todayRecord.check_out ? (
            <button 
              onClick={() => handleAction('out')} 
              disabled={actionLoading}
              className="btn btn-outline border-primary text-primary px-8 py-4 shadow-xl flex gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
              Check Out
            </button>
          ) : (
            <div className="bg-accent/10 text-accent px-6 py-3 rounded-2xl border border-accent/20 font-bold flex items-center gap-2">
              <CheckCircle2 size={20} />
              Shift Completed
            </div>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="font-bold text-slate-900">Attendance Logs</h4>
          <button className="btn btn-outline py-2 text-xs">
            <Filter size={14} />
            Filter logs
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                        {record.profile?.full_name?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{record.profile?.full_name}</span>
                    </div>
                  </td>
                  <td className="text-slate-500 font-medium">{record.date}</td>
                  <td className="font-semibold text-slate-700">{record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="font-semibold text-slate-700">{record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td>
                    <span className={`badge ${
                      record.status === 'present' ? 'badge-success' : 
                      record.status === 'late' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                    No attendance records found.
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
