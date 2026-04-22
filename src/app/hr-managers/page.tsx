'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { Plus, MoreVertical, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HRManagersPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [managers, setManagers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!authLoading) {
      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchManagers();
    }
  }, [authLoading, profile]);

  async function fetchManagers() {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'hr')
      .order('full_name', { ascending: true });

    if (!error && data) {
      setManagers(data);
    }
    setDataLoading(false);
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-slate-50 min-h-screen animate-fade-in relative">
      <Header />

      <main className="max-w-7xl mx-auto py-10 px-8 w-full space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">HR Managers</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage your organization's administrative team.</p>
          </div>
          
          {isAdmin && (
            <Link href="/hr-managers/new" className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
              <Plus size={18} />
              Add Manager
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No HR Managers found</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm font-medium">Get started by inviting your first administrative team member.</p>
              <Link href="/hr-managers/new" className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90">
                Invite Manager
              </Link>
            </div>
          ) : managers.map((mgr) => (
            <div key={mgr.id} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-50 hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-2xl font-black shadow-inner">
                  {mgr.avatar_url ? (
                    <img src={mgr.avatar_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                  ) : mgr.full_name?.charAt(0)}
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <MoreVertical size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{mgr.full_name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Senior HR Manager</p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">Active</span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Email</span>
                  <span className="text-slate-900 lowercase">{mgr.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
