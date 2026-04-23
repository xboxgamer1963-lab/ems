'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { 
  Calendar as CalendarIcon, Clock, Users, Plus, 
  ChevronLeft, ChevronRight, MoreVertical, Loader2,
  MapPin, Filter, Search, CheckCircle2, AlertCircle,
  Briefcase, ArrowRight, UserPlus
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function SchedulingPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<any[]>([]);
  const [view, setView] = useState<'week' | 'day'>('week');
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'hr';

  useEffect(() => {
    if (profile?.organization_id) {
      fetchShifts();
    }
  }, [profile?.organization_id]);

  async function fetchShifts() {
    setLoading(true);
    let query = supabase.from('shifts').select('*, profile:profiles(full_name, department, position)');
    
    if (!isAdmin) query = query.eq('user_id', profile?.id);
    else query = query.eq('organization_id', profile?.organization_id);

    const { data } = await query.order('date', { ascending: true });
    if (data) setShifts(data);
    setLoading(false);
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();

  return (
    <div className="animate-fade-in pb-20">
      <Header title="Workforce Scheduling" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Shift Planning</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <CalendarIcon size={16} className="text-primary" /> {isAdmin ? 'Optimizing organizational shifts' : 'Your upcoming work schedule'}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'week' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
             >
               Week
             </button>
             <button 
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'day' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
             >
               Day
             </button>
          </div>
          {isAdmin && (
            <button className="px-6 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
              <Plus size={18} /> Assign Shift
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Calendar Header */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-3 bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition-all"><ChevronLeft size={20} /></button>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">October 14 – October 20, 2024</h3>
              <button className="p-3 bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition-all"><ChevronRight size={20} /></button>
            </div>
            <div className="flex gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Morning</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evening</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-900 rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Night</span>
               </div>
            </div>
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-7 gap-6">
            {days.map((day) => {
              const dayShifts = shifts.filter(s => {
                // Simplified day matching for demo
                return true; // Show in all for visual demo if none found
              });

              return (
                <div key={day} className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{day.substring(0, 3)}</p>
                    <p className="text-xl font-black text-slate-900">14</p>
                  </div>
                  
                  <div className="space-y-3 min-h-[400px]">
                     {shifts.length > 0 ? shifts.slice(0, 2).map((shift, i) => (
                       <div key={i} className={`p-4 rounded-2xl border border-slate-50 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer ${
                         i === 0 ? 'bg-primary/5' : 'bg-purple-50/50'
                       }`}>
                          <div className={`absolute left-0 top-0 w-1 h-full ${i === 0 ? 'bg-primary' : 'bg-purple-500'}`} />
                          <p className="text-[10px] font-black text-slate-900 leading-none mb-2">{shift.start_time.substring(0,5)} - {shift.end_time.substring(0,5)}</p>
                          <p className="text-[10px] font-bold text-slate-500 truncate mb-3">{isAdmin ? shift.profile?.full_name : shift.label}</p>
                          
                          <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all">
                             <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[8px] font-black">{shift.profile?.full_name?.charAt(0) || 'U'}</div>
                             <MoreVertical size={12} className="text-slate-300" />
                          </div>
                       </div>
                     )) : (
                       <div className="h-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                          <Plus size={16} className="text-slate-200" />
                       </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Insights */}
          {isAdmin && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight mb-6">Staffing Coverage</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Engineering', val: 85, color: 'bg-primary' },
                      { label: 'Support', val: 92, color: 'bg-emerald-500' },
                      { label: 'Sales', val: 64, color: 'bg-amber-400' },
                    ].map(s => (
                      <div key={s.label} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">{s.label}</span>
                          <span className="text-slate-900">{s.val}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.color}`} style={{ width: `${s.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 text-white relative overflow-hidden flex flex-col justify-between">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full" />
                   <div>
                     <h4 className="text-lg font-black tracking-tight mb-2">Weekend On-Call</h4>
                     <p className="text-slate-400 text-xs font-medium leading-relaxed">System-wide on-call rotation for upcoming Saturday.</p>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex -space-x-3">
                         {[1,2,3,4].map(i => (
                           <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black">?</div>
                         ))}
                      </div>
                      <button className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                        <ArrowRight size={20} />
                      </button>
                   </div>
                </div>

                <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 flex flex-col items-center justify-center text-center">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                      <UserPlus size={24} className="text-primary" />
                   </div>
                   <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">Open Shifts</h4>
                   <p className="text-xs font-medium text-slate-500 mb-6">There are 4 unclaimed shifts for next week.</p>
                   <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Notify Team</button>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
