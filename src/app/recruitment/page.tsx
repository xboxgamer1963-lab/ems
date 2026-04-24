'use client';

import Header from "@/components/Header";
import { Briefcase, Clock, Sparkles } from 'lucide-react';

export default function RecruitmentPage() {
  return (
    <div className="animate-fade-in pb-20">
      <Header title="Recruitment & ATS" />
      
      <div className="flex flex-col items-center justify-center pt-32 pb-20">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-8 relative group">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <Briefcase size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles size={16} className="text-amber-400" />
          </div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 text-center">
          Talent Acquisition
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-6">
           <Clock size={14} className="text-slate-500" />
           <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Coming Soon</span>
        </div>
        <p className="text-slate-500 font-medium text-center max-w-md leading-relaxed">
          An intelligent Applicant Tracking System to post jobs, manage candidate pipelines, and hire the best talent faster.
        </p>
      </div>
    </div>
  );
}
