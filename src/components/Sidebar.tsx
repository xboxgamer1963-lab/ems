'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';

import { useAuth } from '@/providers/AuthProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', roles: ['admin', 'hr', 'employee'] },
  { icon: Users, label: 'Employee Directory', href: '/employees', roles: ['admin', 'hr'] },
  { icon: Users, label: 'HR Managers', href: '/hr-managers', roles: ['admin'] },
  { icon: Clock, label: 'Attendance', href: '/attendance', roles: ['admin', 'hr', 'employee'] },
  { icon: Calendar, label: 'Leaves', href: '/leaves', roles: ['admin', 'hr', 'employee'] },
  { icon: TrendingUp, label: 'Reports', href: '/reports', roles: ['admin', 'hr'] },
  { icon: CreditCard, label: 'Payroll', href: '/payroll', roles: ['admin', 'employee'] },
  { icon: CreditCard, label: 'Admin Console', href: '/admin', roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const role = profile?.role || 'employee';

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col py-8 px-4 space-y-2 z-50">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold text-primary tracking-tight">Emply Pro</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none mt-1">Enterprise Management</p>
      </div>

      <nav className="flex-1 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          let label = item.label;
          if (role === 'employee') {
            if (item.label === 'Leaves') label = 'My Leaves';
            if (item.label === 'Payroll') label = 'My Payroll'; // Payroll was showing as Admin Console for admin, need to be careful
            // Actually let's look at the navItems again.
          }
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-200 hover:translate-x-1 ${
                isActive 
                  ? 'bg-primary/5 text-primary border-r-4 border-primary' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary' : 'text-slate-400'} />
              <span className="text-sm font-bold tracking-tight">
                {role === 'employee' && item.label === 'Leaves' ? 'My Leaves' : 
                 role === 'employee' && item.label === 'Admin Console' ? 'My Payroll' : // We should probably have a separate Payroll item for employees
                 item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all duration-200 hover:translate-x-1"
        >
          <Settings size={20} className="text-slate-400" />
          <span className="text-sm font-bold tracking-tight">Settings</span>
        </Link>
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all duration-200 hover:translate-x-1"
        >
          <HelpCircle size={20} className="text-slate-400" />
          <span className="text-sm font-bold tracking-tight">Help Center</span>
        </button>

        <div className="pt-4 border-t border-slate-100">
          <Link href="/employees/new" className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 hover:bg-primary/95 flex items-center justify-center gap-2 group mb-4">
            <Plus size={16} />
            Invite Member
          </Link>
        </div>
      </div>
    </aside>
  );
}
