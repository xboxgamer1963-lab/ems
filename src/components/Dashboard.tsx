'use client';

import {
  Users,
  Zap,
  Clock,
  Wallet,
  TrendingUp,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cake,
  Calendar,
  Star,
  AlertCircle,
  Download,
  Plus,
  X,
  Check,
  Search,
  Bell,
  MessageSquare,
  LayoutGrid,
  Loader2,
  MapPin,
  Coffee,
  Heart,
  ChevronRight,
  Stethoscope,
  Plane
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AttendanceTrends from '@/components/AttendanceTrends';
import { useOrgSettings } from '@/providers/OrgSettingsProvider';

// --- ADMIN DASHBOARD ---
function AdminDashboard({ firstName }: { firstName: string }) {
  const { profile } = useAuth();
  const { settings } = useOrgSettings();
  const [statsData, setStatsData] = useState({
    totalEmployees: 0,
    activeNow: 0,
    pendingLeaves: 0,
    monthlyPayroll: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchAdminStats();
    }
  }, [profile?.organization_id]);

  async function fetchAdminStats() {
    try {
      setStatsLoading(true);
      const orgId = profile!.organization_id;
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

      // 1. Total employees (excluding admins)
      const { count: empCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .neq('role', 'admin');

      // 2. Active now — checked in today, no check_out yet
      const { count: activeCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('date', today)
        .not('check_in', 'is', null)
        .is('check_out', null);

      // 3. Pending leave requests
      const { count: leaveCount } = await supabase
        .from('leaves')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'pending');

      // 4. Monthly payroll — sum of salary for this org
      const { data: salaryData } = await supabase
        .from('profiles')
        .select('salary')
        .eq('organization_id', orgId)
        .not('salary', 'is', null);
      const monthlyPayroll = salaryData
        ? salaryData.reduce((sum, p) => sum + (Number(p.salary) / 12), 0)
        : 0;

      setStatsData({
        totalEmployees: empCount || 0,
        activeNow: activeCount || 0,
        pendingLeaves: leaveCount || 0,
        monthlyPayroll: Math.round(monthlyPayroll),
      });

      // 6. Recent activity — latest 3 leaves + newest employee
      const { data: recentLeaves } = await supabase
        .from('leaves')
        .select('id, leave_type, status, created_at, user_id, profile:profiles(full_name)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(2);

      const { data: newEmployees } = await supabase
        .from('profiles')
        .select('id, full_name, created_at, position')
        .eq('organization_id', orgId)
        .neq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(1);

      const activity: any[] = [];
      (recentLeaves || []).forEach(l => {
        const name = (l.profile as any)?.full_name || 'An employee';
        const timeAgo = formatTimeAgo(new Date(l.created_at));
        activity.push({
          id: l.id,
          user: name,
          action: `submitted a ${l.leave_type} leave request`,
          time: timeAgo,
          initials: name.charAt(0).toUpperCase(),
          iconColor: 'bg-amber-50 text-amber-600',
          isLeave: true,
          leaveId: l.id,
          status: l.status,
        });
      });
      (newEmployees || []).forEach(e => {
        const timeAgo = formatTimeAgo(new Date(e.created_at));
        activity.push({
          id: e.id,
          user: e.full_name || 'New employee',
          action: `joined the organization${e.position ? ` as ${e.position}` : ''}`,
          time: timeAgo,
          initials: (e.full_name || 'N').charAt(0).toUpperCase(),
          iconColor: 'bg-emerald-50 text-emerald-600',
          isLeave: false,
        });
      });
      setRecentActivity(activity);

    } catch (err) {
      console.error('Admin stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  }

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  const stats = [
    {
      label: 'Total Employees',
      value: statsLoading ? '—' : statsData.totalEmployees.toLocaleString(),
      change: undefined as string | undefined,
      trend: 'up' as const,
      status: undefined as string | undefined,
      icon: Users,
      color: 'bg-primary/10 text-primary'
    },
    {
      label: 'Active Now',
      value: statsLoading ? '—' : statsData.activeNow.toString(),
      change: undefined as string | undefined,
      trend: 'up' as const,
      status: 'LIVE',
      icon: Zap,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Leave Requests',
      value: statsLoading ? '—' : statsData.pendingLeaves.toString(),
      change: undefined as string | undefined,
      trend: 'up' as const,
      status: statsData.pendingLeaves > 0 ? 'Pending' : undefined,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'Monthly Payroll',
      value: statsLoading ? '—' : `${settings?.currency_symbol || '$'}${statsData.monthlyPayroll.toLocaleString()}`,
      change: 'This month' as string | undefined,
      trend: 'up' as const,
      status: undefined as string | undefined,
      icon: Wallet,
      color: 'bg-primary/5 text-primary'
    },
  ];



  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-8 px-8 w-full">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome back, {firstName}</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Here's what's happening with your organization today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon size={22} />
              </div>
              {stat.change && (
                <span className="text-[10px] font-black flex items-center gap-1 px-2 py-1 rounded-full text-slate-400 bg-slate-50">
                  {stat.change}
                </span>
              )}
              {stat.status && (
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${stat.status === 'LIVE' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {stat.status}
                </span>
              )}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            {statsLoading ? (
              <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceTrends organizationId={profile?.organization_id || ''} totalEmployees={statsData.totalEmployees} />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h4>
            <Link href="/leaves" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-8">
            {statsLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-8">No recent activity.</p>
            ) : (
              recentActivity.map((item, idx) => (
                <div key={item.id} className="flex gap-4 relative">
                  {idx < recentActivity.length - 1 && <div className="absolute left-6 top-12 bottom-[-24px] w-[2px] bg-slate-50" />}
                  <div className={`w-12 h-12 rounded-full ${item.iconColor} flex items-center justify-center z-10 border-4 border-white shadow-sm font-black text-sm flex-shrink-0`}>
                    {item.initials}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-900 leading-tight">
                      <span className="font-black">{item.user}</span> {item.action}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <h4 className="text-3xl font-black tracking-tight mb-2">Hire Smarter with AI</h4>
            <p className="text-on-primary/80 font-bold mb-6 max-w-sm leading-relaxed">Emply's new AI matching identifies top candidates in your directory 60% faster.</p>
            <button className="bg-white text-primary px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0">Explore Talent AI</button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-20 group-hover:translate-x-16 transition-transform duration-1000"></div>
          <Sparkles size={120} className="absolute -bottom-6 -right-6 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="bg-secondary-container rounded-3xl p-8 text-on-secondary-container flex items-center justify-between group overflow-hidden">
          <div className="max-w-[70%] space-y-4">
            <span className="inline-block px-4 py-1.5 bg-primary text-on-primary rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse">New Release</span>
            <h4 className="text-3xl font-black tracking-tight mb-2 leading-tight">Automated Payroll v2.0</h4>
            <p className="text-on-secondary-container/70 font-bold text-sm leading-relaxed">Manage taxes, bonuses and benefits with one click. Now supporting 12+ local currencies.</p>
          </div>
          <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
            <CheckCircle2 size={56} className="text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HR DASHBOARD ---
function HRDashboard() {
  const { profile: hrProfile } = useAuth();
  const { settings } = useOrgSettings();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log('SYNC HR: Fetching pending leaves...');
      const { data, error } = await supabase
        .from('leaves')
        .select('*, profile:profiles(id, full_name, annual_leave_balance, sick_leave_balance, personal_leave_balance)')
        .eq('organization_id', hrProfile?.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SYNC HR: Error fetching leaves:', error);
      }

      if (data) {
        console.log('SYNC HR: Pending requests found:', data.length);
        setRequests(data);
      }
    } catch (err) {
      console.error('SYNC HR: Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected', type: string, userId: string, startDate: string, endDate: string) => {
    try {
      setActionId(id);

      const { error } = await supabase
        .from('leaves')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // If rejected, refund the quota
      if (status === 'rejected') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        let field = '';
        if (type === 'annual') field = 'annual_leave_balance';
        else if (type === 'sick') field = 'sick_leave_balance';
        else if (type === 'personal') field = 'personal_leave_balance';

        if (field) {
          const profile = requests.find(r => r.id === id)?.profile;
          const currentBalance = profile ? profile[field] : 0;

          await supabase
            .from('profiles')
            .update({ [field]: currentBalance + days })
            .eq('id', userId);
        }
      }

      await fetchRequests();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);

  useEffect(() => {
    if (hrProfile?.organization_id) {
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', hrProfile.organization_id)
        .neq('role', 'admin')
        .then(({ count }) => setTotalEmployees(count || 0));
    }
  }, [hrProfile?.organization_id]);

  const hrStats = [
    { label: 'Total Employees', value: totalEmployees !== null ? totalEmployees.toLocaleString() : '—', change: undefined as string | undefined, trend: 'up', icon: Users, color: 'bg-teal-50 text-primary' },
    { label: 'On Leave Today', value: requests.length.toString(), subtitle: 'Pending approval', icon: Calendar, color: 'bg-orange-50 text-orange-600' },
    { label: 'Open Requests', value: requests.length.toString(), badge: requests.length > 0 ? `${requests.length} Pending` : undefined, badgeType: 'error', icon: Star, color: 'bg-purple-50 text-purple-600' },
  ];

  const birthdays = [
    { name: 'Sarah Jenkins', date: 'Today • Design Team', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ3xPgZPaP1GhWmQfF5z2CAjCFbhzqpiaSXKkKOKN7L-u1dhV-eM4BKwDboiopOVHydqwrfeu0jyLml19jXgR25i-9sL07OPjds3irgeEMFT7nov8OyAZZYusRZfvvm-vzjK9JuIkYmnv5utegoziqFPBCPYA3WGgxySptnbQyXCmX0ZhHze4pssg78aui8zPjV9cLW24__9tnZziWozn6XklB5cY6QWOPwxGjFM5cGfCaPwCd6uoHzTufBP8uxQLRGqoGyahU7p4' },
    { name: 'Marcus Thorne', date: 'Tomorrow • Engineering', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7nY-NgV0XmBQncOmRV02wBd1vhyb7_aVOqSjUjidoFYAtjdS5IKzeCx48bSwPI2EbYEJF3K5iToCDwMLw-WC80TaHWWcR07gwxcfylm91MSxlDwPQKvD7mqRZYkVADp5RSq2nLxpPvHbgJk-a6NVTHMcvL5y3hXnwFZvbcrjCU54583JV8h6Tidq8xexBxI7xqGfppVFZ5fy2yTx1_1R6Fg13g22hdJS2SgYS0TWAfdlS0gqEtk9NUx9ZcxVQfiCpIUhk6grtZSQ' },
    { name: 'Lydia Vance', date: 'Oct 24 • Operations', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOL1hZ0yzA-e34Bgk-yix4-1NVkyhwDaqJduqjyBlPL0RpMrzQcZ9Nhfdj8e1fo3FvPy1GiqzdVtXbi6lDojrkqaKajh3E0bxlwG5pER1aF_yqqHB5j3s-P_KsauxYOG8UWgjttSRQGcuGn6nvC8evyu08uESoZVHRdKL0kH2E0MjxHAs9zLO9AmX3fgcz8iDsJ-onbgeZJrmy-kE-rW4scNnkftJoWqHfekroDPGYitUz75oqntlBtIHuMApc9HdK0NNj5K0FSLU' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-8 px-8 w-full">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">HR Hub Overview</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">You have {requests.length} pending review requests.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all">
            <Download size={18} /> Export CSV
          </button>
          <Link href="/employees/new" className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={18} /> New Employee
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {hrStats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={22} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              {stat.change && (
                <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                  <TrendingUp size={12} /> {stat.change} this month
                </p>
              )}
              {stat.subtitle && (
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{stat.subtitle}</p>
              )}
              {stat.badge && (
                <p className={`text-[10px] font-black uppercase tracking-widest mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${stat.badgeType === 'error' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  <AlertCircle size={10} /> {stat.badge}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2 bg-white p-8 rounded-3xl shadow-[0_4px_20_rgba(0,0,0,0.02)] border border-slate-50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Birthdays</h3>
            <Cake size={20} className="text-slate-300" />
          </div>
          <div className="space-y-6">
            {birthdays.map((b) => (
              <div key={b.name} className="flex items-center gap-4 group cursor-default">
                <img className="h-12 w-12 rounded-full object-cover border-4 border-white shadow-sm group-hover:scale-110 transition-transform" src={b.avatar} alt={b.name} />
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 leading-tight">{b.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{b.date}</p>
                </div>
                <button className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Sparkles size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</p>
            <button className="w-full bg-white text-slate-700 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest flex justify-between items-center px-4 hover:border-primary transition-all group">
              Order Team Cupcakes
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Pending Leave Approvals</h3>
            <Link href="/leaves" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-8 py-4">Leave Type</th>
                  <th className="px-8 py-4">Duration</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/5 text-primary flex items-center justify-center font-black text-[10px] border-2 border-white">{l.profile?.full_name?.charAt(0)}</div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{l.profile?.full_name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary">{l.leave_type}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-500">{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button
                        onClick={() => handleAction(l.id, 'approved', l.leave_type, l.profile.id, l.start_date, l.end_date)}
                        disabled={actionId === l.id}
                        className="btn bg-emerald-50 text-emerald-600 px-4 py-2 hover:bg-emerald-600 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        {actionId === l.id ? <Loader2 className="animate-spin" size={14} /> : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleAction(l.id, 'rejected', l.leave_type, l.profile.id, l.start_date, l.end_date)}
                        disabled={actionId === l.id}
                        className="btn bg-red-50 text-red-600 px-4 py-2 hover:bg-red-600 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        {actionId === l.id ? <Loader2 className="animate-spin" size={14} /> : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      No pending requests to show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- EMPLOYEE DASHBOARD ---
function EmployeeDashboard({ firstName }: { firstName: string }) {
  const { profile } = useAuth();
  const { settings } = useOrgSettings();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [status, setStatus] = useState<'off' | 'active' | 'break'>('off');
  const [session, setSession] = useState<any>(null);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [loading, setLoading] = useState(true);

  const [paystubs, setPaystubs] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocalDate = () => {
    // en-CA is YYYY-MM-DD
    return new Date().toLocaleDateString('en-CA');
  };

  // Fetch today's attendance status and recent payroll
  useEffect(() => {
    if (profile?.id) {
      console.log('SYNC: Profile loaded, init fetch...', profile.id);
      fetchTodayAttendance();
      fetchRecentPayroll();
    }
  }, [profile?.id]);

  async function fetchTodayAttendance() {
    try {
      setLoading(true);
      const today = getLocalDate();
      console.log('SYNC: Today is', today);

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('SYNC: DB Error during fetch:', error);
      }

      if (data) {
        console.log('SYNC: Session restored successfully!', data);
        setSession(data);
        if (data.check_out) {
          console.log('SYNC: Session already closed');
          setStatus('off');
        } else if (data.break_start) {
          console.log('SYNC: Session is on break');
          setStatus('break');
        } else {
          console.log('SYNC: Session is active');
          setStatus('active');
        }
      } else {
        console.log('SYNC: No session record found for user', profile?.id, 'on date', today);
        setStatus('off');
        setSession(null);
      }
    } catch (err) {
      console.error('SYNC: Exception during fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentPayroll() {
    try {
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('user_id', profile?.id)
        .order('period_end', { ascending: false })
        .limit(5);

      if (data) setPaystubs(data);
    } catch (err) {
      console.error('Fetch Payroll Error:', err);
    }
  }

  // Elapsed time counter
  useEffect(() => {
    let interval: any;
    if (status === 'active' && session?.check_in) {
      interval = setInterval(() => {
        const start = new Date(session.check_in).getTime();
        const now = new Date().getTime();
        const breakMs = (session.total_break_seconds || 0) * 1000;
        setElapsed(formatDuration(now - start - breakMs));
      }, 1000);
    } else if (status === 'off' && session?.check_in && session?.check_out) {
      const start = new Date(session.check_in).getTime();
      const end = new Date(session.check_out).getTime();
      const breakMs = (session.total_break_seconds || 0) * 1000;
      setElapsed(formatDuration(end - start - breakMs));
    } else if (status === 'off' && !session) {
      setElapsed('00:00:00');
    }
    return () => clearInterval(interval);
  }, [status, session]);

  function formatDuration(ms: number) {
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  }

  async function handleClockIn() {
    if (!profile) return;
    try {
      setLoading(true);
      const now = new Date();
      const today = getLocalDate();

      // Calculate if late based on Org Settings
      let isLate = false;
      if (settings?.work_start_time) {
        const [startH, startM] = settings.work_start_time.split(':').map(Number);
        const threshold = settings.late_threshold_minutes || 0;

        const checkTime = new Date();
        checkTime.setHours(startH, startM + threshold, 0, 0);

        if (now > checkTime) {
          isLate = true;
        }
      } else {
        // Fallback to 9:00 AM
        isLate = now.getHours() >= 9 && now.getMinutes() > 0;
      }

      console.log('SYNC: Clock In triggering for', today, 'at', now.toISOString());

      let result: any;
      if (session) {
        console.log('SYNC: Updating existing session', session.id);
        result = await supabase
          .from('attendance')
          .update({
            check_out: null,
            status: isLate ? 'late' : 'present'
          })
          .eq('id', session.id)
          .select()
          .single();
      } else {
        console.log('SYNC: Creating brand new session for', profile.id);
        result = await supabase
          .from('attendance')
          .insert({
            user_id: profile.id,
            organization_id: profile.organization_id,
            date: today,
            check_in: now.toISOString(),
            status: isLate ? 'late' : 'present'
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('SYNC: DB Error during clock-in:', result.error);
        throw result.error;
      }

      if (result.data) {
        console.log('SYNC: Operation successful!', result.data);
        setSession(result.data);
        setStatus('active');
        localStorage.setItem('emply_last_check', today); // Extra local hint
      }
    } catch (err: any) {
      console.error('SYNC: Exception during clock-in:', err);
      alert(`Action Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleBreak() {
    if (!session) return;
    try {
      setLoading(true);
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('attendance')
        .update({ break_start: now })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSession(data);
        setStatus('break');
      }
    } catch (err: any) {
      alert(`Break Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleResume() {
    if (!session || !session.break_start) return;
    try {
      setLoading(true);
      const now = new Date();
      const breakStart = new Date(session.break_start);
      const breakDiffSeconds = Math.floor((now.getTime() - breakStart.getTime()) / 1000);
      const newTotalBreak = (session.total_break_seconds || 0) + breakDiffSeconds;

      const { data, error } = await supabase
        .from('attendance')
        .update({
          break_start: null,
          total_break_seconds: newTotalBreak
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSession(data);
        setStatus('active');
      }
    } catch (err: any) {
      alert(`Resume Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleClockOut() {
    if (!session) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSession(data);
        setStatus('off');
      }
    } catch (err: any) {
      alert(`Clock Out Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const balances = [
    { label: 'Annual Leaves', value: (profile?.annual_leave_balance || 14).toString(), icon: Plane, color: 'bg-primary/5 text-primary' },
    { label: 'Sick Leaves', value: (profile?.sick_leave_balance || 8).toString(), icon: Stethoscope, color: 'bg-red-50 text-red-600' },
    { label: 'Personal Days', value: (profile?.personal_leave_balance || 5).toString(), icon: Heart, color: 'bg-amber-50 text-amber-600' }
  ];

  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.id) {
      fetchRecentLeaves();
    }
  }, [profile?.id]);

  async function fetchRecentLeaves() {
    const { data } = await supabase
      .from('leaves')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecentLeaves(data);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-8 px-8 w-full pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Welcome back, {firstName}! 👋</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Here's what's happening with your workspace today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leaves" className="px-6 py-3 bg-white text-primary border border-slate-100 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:-translate-y-1 transition-all active:scale-95">View Schedule</Link>
          <Link href="/leaves/new" className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={18} /> Apply Leave
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Announcement Banner */}
        <div className="col-span-12 relative overflow-hidden bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/5 group">
          <div className="relative z-10 space-y-4 flex-1">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Company Update</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Annual Team Offsite 2024: Details Released!</h3>
            <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">We're heading to the mountains this August. Check out the itinerary and confirm your dietary preferences by Friday.</p>
            <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center group/btn">
              Read details <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="relative w-full md:w-80 h-48 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-[1.02] transition-transform">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTcRVoNn0OOOiCD5626cuURXQBH-_8zdDzMbVXXJjwNmZ9SIyvy2_0BBrkwmB6iDVSN_dWGt3iwWAw4XSVcd1ppuyPgPydubwwPJ4fhCaqlCoP9uJ-pGKInZa-a8iv7_ifwVkQ9IMX28iqD5ETEfvonl-xE407e8vGb9y5J1DNtz3-rmIcDDGsUNap3T2nRudi2uBA-cIcRAWhHPQWoJ5fZnHCWOgDy_o2M0GViz_g-qDgZ293vUORRW-Z6WPJPcvsUxsWmGs5WRk" alt="Offsite" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-12 translate-x-32 group-hover:translate-x-24 transition-transform duration-1000"></div>
        </div>

        {/* Clock widget */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-10 border border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Session</p>
            <div className="flex items-center gap-2">
              {status !== 'off' && session?.check_in && !session?.check_out && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                  {status === 'active' ? 'Active' : 'On Break'}
                </div>
              )}
              {session?.check_out && (
                <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black tracking-widest uppercase">
                  Finished
                </div>
              )}
              <Clock size={20} className="text-primary" />
            </div>
          </div>
          <div className="text-center py-6">
            <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums">
              {status === 'active' || (status === 'off' && session?.check_out) ? elapsed : time}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
              {status === 'off' && !session ? 'Not clocked in' :
                status === 'off' && session?.check_out ? 'Work day ended' :
                  `Logged in at ${new Date(session.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          <div className="mt-10 space-y-3">
            {status === 'off' ? (
              <button
                onClick={handleClockIn}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (session && session.check_out ? 'Restart Session' : 'Clock In')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleClockOut}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Clock Out (Finish Day)'}
                </button>
                <button
                  onClick={status === 'active' ? handleBreak : handleResume}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      {status === 'active' ? (
                        <>
                          <div className="w-2 h-2 bg-slate-400 rounded-sm"></div>
                          Pause Timer / Take Break
                        </>
                      ) : (
                        <>
                          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-primary border-b-[5px] border-b-transparent"></div>
                          Resume Timer
                        </>
                      )}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Leave Balances */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-10 border border-slate-50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Leave Balances</h3>
            <div className="flex gap-4">
              {recentLeaves.length > 0 && (
                <div className="flex -space-x-2">
                  {recentLeaves.map((rl, i) => (
                    <div key={rl.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-sm ${rl.status === 'approved' ? 'bg-emerald-500 text-white' :
                      rl.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`} title={`${rl.leave_type}: ${rl.status}`}>
                      {rl.leave_type.charAt(0)}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/leaves" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View History</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {balances.map((b) => (
              <div key={b.label} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:bg-primary/5 hover:border-primary/10 transition-all duration-300">
                <div className={`w-14 h-14 ${b.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                  <b.icon size={28} />
                </div>
                <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">{b.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Compensation — visible to employee only, salary set by HR/Admin */}
        {profile?.salary != null && (
          <div className="col-span-12 relative overflow-hidden bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50 p-10 group">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-80 h-full bg-primary/5 -skew-x-12 translate-x-32 group-hover:translate-x-24 transition-transform duration-1000" />
              <Wallet size={200} className="absolute -bottom-8 -right-8 text-primary/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Left — salary figures */}
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner flex-shrink-0">
                  <Wallet className="text-primary" size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">My Annual Salary</p>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                    {settings?.currency_symbol || '$'}{Number(profile.salary).toLocaleString()}
                  </h2>
                  <p className="text-sm font-bold text-primary mt-1">
                    {settings?.currency_symbol || '$'}{Math.round(Number(profile.salary) / 12).toLocaleString()}
                    <span className="text-slate-400 font-medium"> / month (gross)</span>
                  </p>
                </div>
              </div>

              {/* Right — meta details */}
              <div className="flex flex-wrap gap-6">
                {profile.position && (
                  <div className="bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</p>
                    <p className="text-sm font-black text-slate-800">{profile.position}</p>
                  </div>
                )}
                {profile.department && (
                  <div className="bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                    <p className="text-sm font-black text-slate-800">{profile.department}</p>
                  </div>
                )}
                {profile.start_date && (
                  <div className="bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                    <p className="text-sm font-black text-slate-800">
                      {new Date(profile.start_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paystubs */}
        <div className="col-span-12 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-10 border border-slate-50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Paystubs</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Your latest salary and benefits statements.</p>
            </div>
            <button className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all">
              <Download size={18} /> Download All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                  <th className="px-8 py-4">Pay Period</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Gross Pay</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paystubs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900 tracking-tight">
                        {new Date(p.period_start).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(p.period_end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Payment date: {p.payment_date || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{settings?.currency_symbol || '$'}{p.net_pay?.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
                {paystubs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const role = profile?.role || 'employee';

  return (
    <div className="flex flex-col flex-1">
      <Header />
      {role === 'hr' ? (
        <HRDashboard />
      ) : role === 'admin' ? (
        <AdminDashboard firstName={firstName} />
      ) : (
        <EmployeeDashboard firstName={firstName} />
      )}
    </div>
  );
}
