'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import {
  TrendingUp, Clock, CreditCard, Calendar, Download, Filter,
  Loader2, Users, CheckCircle2, XCircle, AlertCircle,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useOrgSettings } from '@/providers/OrgSettingsProvider';

type Tab = 'attendance' | 'payroll' | 'leaves';

export default function ReportsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { settings } = useOrgSettings();
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [loading, setLoading] = useState(true);

  // Attendance data
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, late: 0, absent: 0, total: 0 });

  // Payroll data
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [payrollStats, setPayrollStats] = useState({ totalPaid: 0, totalPending: 0, recordCount: 0 });

  // Leaves data
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState({ approved: 0, pending: 0, rejected: 0, total: 0 });

  const isAdmin = profile?.role === 'admin';
  const isHR = profile?.role === 'hr';

  useEffect(() => {
    if (!authLoading && profile) {
      fetchAllData();
    }
  }, [authLoading, profile]);

  async function fetchAllData() {
    setLoading(true);
    await Promise.all([fetchAttendance(), fetchPayroll(), fetchLeaves()]);
    setLoading(false);
  }

  async function fetchAttendance() {
    const { data } = await supabase
      .from('attendance')
      .select('*, profile:profiles(full_name, email, department)')
      .eq('organization_id', profile?.organization_id)
      .order('date', { ascending: false })
      .limit(200);

    const records = data || [];
    setAttendanceRecords(records);
    setAttendanceStats({
      present: records.filter(r => r.status === 'present').length,
      late: records.filter(r => r.status === 'late').length,
      absent: records.filter(r => r.status === 'absent').length,
      total: records.length,
    });
  }

  async function fetchPayroll() {
    const { data } = await supabase
      .from('payroll')
      .select('*, profile:profiles(full_name, email, department)')
      .eq('organization_id', profile?.organization_id)
      .order('period_end', { ascending: false })
      .limit(200);

    const records = data || [];
    setPayrollRecords(records);
    setPayrollStats({
      totalPaid: records.filter(p => p.status === 'paid').reduce((s, p) => s + (p.net_pay || 0), 0),
      totalPending: records.filter(p => p.status !== 'paid').reduce((s, p) => s + (p.net_pay || 0), 0),
      recordCount: records.length,
    });
  }

  async function fetchLeaves() {
    const { data } = await supabase
      .from('leaves')
      .select('*, profile:profiles(full_name, email, department)')
      .eq('organization_id', profile?.organization_id)
      .order('created_at', { ascending: false })
      .limit(200);

    const records = data || [];
    setLeaveRecords(records);
    setLeaveStats({
      approved: records.filter(l => l.status === 'approved').length,
      pending: records.filter(l => l.status === 'pending').length,
      rejected: records.filter(l => l.status === 'rejected').length,
      total: records.length,
    });
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!isAdmin && !isHR) {
    return (
      <div className="animate-fade-in">
        <Header title="Reports" />
        <div className="flex flex-col items-center justify-center py-32">
          <AlertCircle size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Access Denied</p>
          <p className="text-slate-500 font-medium mt-2">Reports are only available for Admin and HR roles.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'attendance', label: 'Attendance', icon: Clock },
    { key: 'payroll', label: 'Payroll', icon: CreditCard },
    { key: 'leaves', label: 'Leaves', icon: Calendar },
  ];

  const presentPct = attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0;
  const latePct = attendanceStats.total > 0 ? Math.round((attendanceStats.late / attendanceStats.total) * 100) : 0;

  return (
    <div className="animate-fade-in pb-20">
      <Header title="Reports" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Organization Reports</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Comprehensive analytics across your workforce.</p>
        </div>
        <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-10 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.key
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
        <>
          {/* ===== ATTENDANCE TAB ===== */}
          {activeTab === 'attendance' && (
            <div className="space-y-8">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Records" value={attendanceStats.total.toString()} color="bg-primary/10 text-primary" />
                <StatCard icon={CheckCircle2} label="Present" value={`${attendanceStats.present}`} sub={`${presentPct}% of total`} color="bg-emerald-50 text-emerald-600" />
                <StatCard icon={Clock} label="Late Arrivals" value={`${attendanceStats.late}`} sub={`${latePct}% of total`} color="bg-amber-50 text-amber-600" />
                <StatCard icon={XCircle} label="Absent" value={`${attendanceStats.absent}`} color="bg-red-50 text-red-500" />
              </div>

              {/* Attendance Rate Visual */}
              <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Attendance Breakdown</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    {attendanceStats.total > 0 && (
                      <>
                        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${presentPct}%` }} />
                        <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${latePct}%` }} />
                        <div className="h-full bg-red-400 transition-all duration-700" style={{ width: `${100 - presentPct - latePct}%` }} />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-8">
                  <Legend color="bg-emerald-500" label="Present" value={`${presentPct}%`} />
                  <Legend color="bg-amber-400" label="Late" value={`${latePct}%`} />
                  <Legend color="bg-red-400" label="Absent" value={`${attendanceStats.total > 0 ? 100 - presentPct - latePct : 0}%`} />
                </div>
              </div>

              {/* Attendance Table */}
              <ReportTable
                title="Attendance Log"
                headers={['Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Status']}
                rows={attendanceRecords.map(r => [
                  r.profile?.full_name || '—',
                  r.profile?.department || '—',
                  r.date,
                  r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                  r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
                  r.status,
                ])}
                statusIndex={5}
              />
            </div>
          )}

          {/* ===== PAYROLL TAB ===== */}
          {activeTab === 'payroll' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={CreditCard} label="Total Paid" value={`${settings?.currency_symbol || '$'}${payrollStats.totalPaid.toLocaleString()}`} color="bg-emerald-50 text-emerald-600" />
                <StatCard icon={AlertCircle} label="Pending Amount" value={`${settings?.currency_symbol || '$'}${payrollStats.totalPending.toLocaleString()}`} color="bg-amber-50 text-amber-600" />
                <StatCard icon={BarChart3} label="Total Records" value={payrollStats.recordCount.toString()} color="bg-primary/10 text-primary" />
              </div>

              <ReportTable
                title="Payroll Records"
                headers={['Employee', 'Department', 'Period', 'Net Pay', 'Status']}
                rows={payrollRecords.map(p => [
                  p.profile?.full_name || '—',
                  p.profile?.department || '—',
                  `${new Date(p.period_start).toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${new Date(p.period_end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`,
                  `${settings?.currency_symbol || '$'}${(p.net_pay || 0).toLocaleString()}`,
                  p.status,
                ])}
                statusIndex={4}
              />
            </div>
          )}

          {/* ===== LEAVES TAB ===== */}
          {activeTab === 'leaves' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={Calendar} label="Total Requests" value={leaveStats.total.toString()} color="bg-primary/10 text-primary" />
                <StatCard icon={CheckCircle2} label="Approved" value={leaveStats.approved.toString()} color="bg-emerald-50 text-emerald-600" />
                <StatCard icon={Clock} label="Pending" value={leaveStats.pending.toString()} color="bg-amber-50 text-amber-600" />
                <StatCard icon={XCircle} label="Rejected" value={leaveStats.rejected.toString()} color="bg-red-50 text-red-500" />
              </div>

              {/* Leave Breakdown Bar */}
              <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Leave Status Breakdown</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    {leaveStats.total > 0 && (
                      <>
                        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.round((leaveStats.approved / leaveStats.total) * 100)}%` }} />
                        <div className="h-full bg-amber-400 transition-all duration-700" style={{ width: `${Math.round((leaveStats.pending / leaveStats.total) * 100)}%` }} />
                        <div className="h-full bg-red-400 transition-all duration-700" style={{ width: `${Math.round((leaveStats.rejected / leaveStats.total) * 100)}%` }} />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-8">
                  <Legend color="bg-emerald-500" label="Approved" value={`${leaveStats.total > 0 ? Math.round((leaveStats.approved / leaveStats.total) * 100) : 0}%`} />
                  <Legend color="bg-amber-400" label="Pending" value={`${leaveStats.total > 0 ? Math.round((leaveStats.pending / leaveStats.total) * 100) : 0}%`} />
                  <Legend color="bg-red-400" label="Rejected" value={`${leaveStats.total > 0 ? Math.round((leaveStats.rejected / leaveStats.total) * 100) : 0}%`} />
                </div>
              </div>

              <ReportTable
                title="Leave Requests"
                headers={['Employee', 'Department', 'Type', 'From', 'To', 'Status']}
                rows={leaveRecords.map(l => [
                  l.profile?.full_name || '—',
                  l.profile?.department || '—',
                  l.leave_type,
                  l.start_date,
                  l.end_date,
                  l.status,
                ])}
                statusIndex={5}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Reusable Sub-Components ── */

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon size={22} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      {sub && <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-slate-900">{value}</span>
    </div>
  );
}

function ReportTable({ title, headers, rows, statusIndex }: { title: string; headers: string[]; rows: string[][]; statusIndex: number }) {
  return (
    <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rows.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
              {headers.map(h => (
                <th key={h} className="px-8 py-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-8 py-5">
                    {j === 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black uppercase">{cell.charAt(0)}</div>
                        <span className="text-sm font-bold text-slate-900">{cell}</span>
                      </div>
                    ) : j === statusIndex ? (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        cell === 'present' || cell === 'paid' || cell === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        cell === 'late' || cell === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-500'
                      }`}>
                        {cell}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-slate-600">{cell}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-8 py-20 text-center">
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
  );
}
