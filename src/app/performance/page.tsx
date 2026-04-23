'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { 
  TrendingUp, Star, Target, FileText, 
  Plus, Search, Filter, Loader2, 
  ChevronRight, Award, Zap, BarChart3,
  CheckCircle2, AlertCircle, Users
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

type PerformanceTab = 'kpis' | 'reviews' | 'feedback';

export default function PerformancePage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<PerformanceTab>('kpis');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'hr';

  useEffect(() => {
    if (profile?.organization_id) {
      fetchData();
    }
  }, [profile?.organization_id]);

  async function fetchData() {
    setLoading(true);
    await Promise.all([fetchKPIs(), fetchReviews()]);
    setLoading(false);
  }

  async function fetchKPIs() {
    let query = supabase.from('kpis').select('*').eq('organization_id', profile?.organization_id);
    if (!isAdmin) query = query.eq('user_id', profile?.id);
    
    const { data } = await query.order('created_at', { ascending: false });
    if (data) setKpis(data);
  }

  async function fetchReviews() {
    let query = supabase.from('performance_reviews').select('*, profile:profiles(full_name, department, position)');
    if (!isAdmin) query = query.eq('user_id', profile?.id);
    else query = query.eq('organization_id', profile?.organization_id);

    const { data } = await query.order('created_at', { ascending: false });
    if (data) setReviews(data);
  }

  return (
    <div className="animate-fade-in pb-20">
      <Header title="Performance Management" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Performance Hub</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Award size={16} className="text-primary" /> {isAdmin ? 'Managing organizational growth' : 'Tracking your professional growth'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-4">
             <button className="px-6 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
              <Plus size={18} /> New Review Cycle
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 mb-10 w-fit">
        {[
          { id: 'kpis', label: 'Key Metrics (KPIs)', icon: Target },
          { id: 'reviews', label: 'Performance Reviews', icon: FileText },
          { id: 'feedback', label: '360 Feedback', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as PerformanceTab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
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
        <div className="space-y-8">
          {activeTab === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="bg-white p-8 rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden group hover:border-primary/20 transition-all">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                    <Zap size={22} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{kpi.title}</h3>
                  <p className="text-xs font-medium text-slate-400 mb-6 line-clamp-2">{kpi.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                      <p className="text-lg font-black text-slate-900">{kpi.target_value}{kpi.unit}</p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${Math.min(100, kpi.target_value)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {isAdmin && (
                <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all group">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                   </div>
                   <p className="text-xs font-black uppercase tracking-widest">Add New KPI</p>
                </button>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
             <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-[2rem] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl">
                        {rev.profile?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{rev.profile?.full_name || 'My Review'}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            rev.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {rev.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{rev.cycle_name}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-10">
                       <div className="text-center md:text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance Score</p>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                            View Report
                          </button>
                          <button className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all group">
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <FileText size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No reviews found</p>
                  </div>
                )}
             </div>
          )}

          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[3rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Peer Feedback</h3>
                    <Users size={24} className="text-slate-200" />
                  </div>
                  <div className="space-y-6">
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                      360-degree feedback allows peers, subordinates, and managers to provide constructive input anonymously.
                    </p>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Upcoming Cycle</p>
                      <h4 className="text-lg font-black text-slate-900 mb-2">Annual 360 Review 2024</h4>
                      <p className="text-xs font-bold text-primary">Starts in 12 days • October 15</p>
                    </div>
                    <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary transition-all">
                      Configure Feedback Forms
                    </button>
                  </div>
               </div>
               
               <div className="bg-primary p-10 rounded-[3rem] shadow-xl shadow-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-32 -mt-32 rounded-full" />
                  <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                      <Award size={28} />
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Recognize Excellence</h3>
                    <p className="text-primary-foreground/80 font-medium leading-relaxed">
                      Boost morale by publicly recognizing top performers and rewarding high KPI achievers.
                    </p>
                    <button className="px-8 py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all active:scale-95 shadow-lg">
                      Send Kudos
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
