'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { 
  Plus, Search, Filter, Briefcase, Users, 
  MapPin, Clock, MoreVertical, ChevronRight,
  Loader2, Mail, Phone, FileText, Star,
  CheckCircle2, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

type RecruitmentTab = 'jobs' | 'candidates' | 'pipelines';

export default function RecruitmentPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<RecruitmentTab>('jobs');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchData();
    }
  }, [profile?.organization_id]);

  async function fetchData() {
    setLoading(true);
    await Promise.all([fetchJobs(), fetchCandidates()]);
    setLoading(false);
  }

  async function fetchJobs() {
    const { data } = await supabase
      .from('job_postings')
      .select('*')
      .eq('organization_id', profile?.organization_id)
      .order('created_at', { ascending: false });
    if (data) setJobs(data);
  }

  async function fetchCandidates() {
    const { data } = await supabase
      .from('candidates')
      .select('*, job_postings(title)')
      .eq('organization_id', profile?.organization_id)
      .order('created_at', { ascending: false });
    if (data) setCandidates(data);
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'hr';

  if (!isAdmin) {
    return (
      <div className="animate-fade-in">
        <Header title="Recruitment" />
        <div className="flex flex-col items-center justify-center py-32">
          <AlertCircle size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Access Denied</p>
          <p className="text-slate-500 font-medium mt-2">Recruitment management is only available for Admin and HR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <Header title="Recruitment & ATS" />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Talent Acquisition</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Users size={16} className="text-primary" /> {candidates.length} Active Candidates across {jobs.length} open roles
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            Pipeline Settings
          </button>
          <button className="px-6 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={18} /> Post New Job
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 mb-10 w-fit">
        {[
          { id: 'jobs', label: 'Job Openings', icon: Briefcase },
          { id: 'candidates', label: 'All Candidates', icon: Users },
          { id: 'pipelines', label: 'Visual Pipeline', icon: ArrowRight },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as RecruitmentTab)}
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
          {activeTab === 'jobs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-[2rem] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-50 hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="flex justify-between items-start mb-6 relative">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Briefcase size={28} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        job.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {job.status}
                      </span>
                      <button className="p-2 hover:bg-slate-50 rounded-lg"><MoreVertical size={18} className="text-slate-400" /></button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <MapPin size={14} /> {job.location || 'Remote'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock size={14} /> {job.job_type}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Users size={14} /> {candidates.filter(c => c.job_id === job.id).length} applicants
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">?</div>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:gap-3 transition-all">
                      Manage Applications <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <EmptyState label="No job postings yet" icon={Briefcase} />}
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search candidates by name, email or skill..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm"><Filter size={18} /></button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                      <th className="px-8 py-5">Candidate</th>
                      <th className="px-8 py-5">Applied For</th>
                      <th className="px-8 py-5">Stage</th>
                      <th className="px-8 py-5">Rating</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {candidates.map((can) => (
                      <tr key={can.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                              {can.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight">{can.full_name}</p>
                              <p className="text-[10px] font-bold text-slate-400">{can.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-slate-600">{can.job_postings?.title || 'General'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            can.stage === 'hired' ? 'bg-emerald-50 text-emerald-600' :
                            can.stage === 'rejected' ? 'bg-red-50 text-red-500' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {can.stage}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} size={12} className={star <= (can.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-all"><Mail size={16} /></button>
                            <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-all"><FileText size={16} /></button>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Profile</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {candidates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <EmptyState label="No candidates found" icon={Users} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
                {['Applied', 'Screening', 'Interview', 'Offer'].map(stage => (
                  <div key={stage} className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stage}</h4>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {candidates.filter(c => c.stage.toLowerCase() === stage.toLowerCase()).length}
                      </span>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl p-4 min-h-full border border-dashed border-slate-200">
                      {candidates.filter(c => c.stage.toLowerCase() === stage.toLowerCase()).map(c => (
                        <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3 hover:border-primary/30 transition-all cursor-pointer group">
                           <p className="text-sm font-black text-slate-900 mb-1">{c.full_name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 truncate">{c.job_postings?.title}</p>
                           <div className="flex justify-between items-center">
                              <div className="flex gap-0.5">
                                {[1,2,3].map(s => <Star key={s} size={8} className="fill-amber-400 text-amber-400" />)}
                              </div>
                              <ArrowRight size={14} className="text-slate-200 group-hover:text-primary transition-colors" />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label, icon: Icon }: { label: string, icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 w-full">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
        <Icon size={32} className="text-slate-200" />
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{label}</p>
    </div>
  );
}
