'use client';

import { useAuth } from '@/providers/AuthProvider';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  LayoutGrid, 
  LogOut 
} from 'lucide-react';

export default function Header({ title }: { title?: string }) {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8 h-16 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-slate-400" 
            placeholder="Search for employees, documents..." 
            type="text"
          />
        </div>
        {title && (
          <h1 className="text-xl font-black text-slate-900 tracking-tighter md:hidden">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="hover:bg-slate-100 rounded-full p-2.5 transition-colors duration-200 relative group">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-red-500"></span>
        </button>
        <button className="hidden sm:block hover:bg-slate-100 rounded-full p-2.5 transition-colors duration-200">
          <MessageSquare size={20} className="text-slate-600" />
        </button>
        <button className="hidden sm:block hover:bg-slate-100 rounded-full p-2.5 transition-colors duration-200 mr-4">
          <LayoutGrid size={20} className="text-slate-600" />
        </button>
        
        <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
              {profile?.full_name || 'User Name'}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {profile?.role === 'admin' ? 'HR Director' : profile?.role || 'Employee'}
            </p>
          </div>
          <div className="relative group cursor-pointer" onClick={() => signOut()}>
            <img 
              className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-sm" 
              src={profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBO2cI78cjbXAhJkkYKfY7aAhcShjRHZbzUmQu5-CzSPTIKkVMwMQxgfpR5xSIkKBO5iCggXqQ_CS-Gcj9RJfjDXNrhLdNBN58fv9m9Sq3LxiFbtDrv-m0FkgatOHzCUtgGkpI1BTAMs2xwM4WXT8P5o9SV5tetZhwABATC5S6-ex5Sv6ndtWtQtFoKvSKFtzXvEhhDAAkga-YvgcWeVUJtStNSGW33UhfkVGPqEqG13zivdp5PmWEMGVZntZ6-qh7hBlIf2jQ2FwE"} 
              alt="Profile" 
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <LogOut size={10} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
