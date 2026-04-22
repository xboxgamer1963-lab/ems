'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  Calendar as CalendarIcon, 
  DollarSign,
  Info,
  ShieldCheck,
  Check,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function AddEmployeePage() {
  const { profile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  
  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dept: 'Engineering',
    position: 'Senior Developer',
    startDate: new Date().toISOString().split('T')[0],
    salary: '85000',
    role: 'employee',
    password: Math.random().toString(36).slice(-8),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orgName: profile?.organization?.name || 'Your Company',
          orgId: profile?.organization_id,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/employees'), 2000);
      } else {
        const result = await response.json();
        alert(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-[1000px] mx-auto py-12 px-8 w-full animate-fade-in">
        {/* Page Header */}
        <div className="mb-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary mb-4 group hover:underline"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest">Back to Directory</span>
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Add New Employee</h2>
          <p className="text-lg font-medium text-slate-500 mt-1">Initialize the record for a new organization member.</p>
        </div>

        {/* Multi-step Progress Indicator */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex flex-1 items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className="ml-3 text-xs font-black uppercase tracking-widest">Personal</span>
            </div>
            <div className={`flex-1 mx-4 h-[2px] rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            
            <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
              <span className="ml-3 text-xs font-black uppercase tracking-widest">Job</span>
            </div>
            <div className={`flex-1 mx-4 h-[2px] rounded-full ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            
            <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
              <span className="ml-3 text-xs font-black uppercase tracking-widest">Pay</span>
            </div>
          </div>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl p-16 shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <Check size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Success!</h3>
            <p className="text-lg font-medium text-slate-500">Employee invited successfully. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Details */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-10 border border-slate-50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800" 
                    placeholder="e.g. Jonathan Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800" 
                    placeholder="jonathan.s@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Job Details */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-10 border border-slate-50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Job Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Position</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCustomPosition(!isCustomPosition);
                        if (!isCustomPosition) setFormData({...formData, position: ''});
                        else setFormData({...formData, position: 'Senior Developer'});
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      {isCustomPosition ? 'Select from list' : 'Manual Entry'}
                    </button>
                  </div>
                  {isCustomPosition ? (
                    <input 
                      type="text"
                      required
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800" 
                      placeholder="Enter custom position"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    />
                  ) : (
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800 appearance-none"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    >
                      <option>Senior Developer</option>
                      <option>Product Manager</option>
                      <option>UI/UX Designer</option>
                      <option>Marketing Lead</option>
                      <option>Sales Associate</option>
                      <option>Operations Manager</option>
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800 appearance-none"
                    value={formData.dept}
                    onChange={(e) => setFormData({...formData, dept: e.target.value})}
                  >
                    <option>Engineering</option>
                    <option>Product</option>
                    <option>Design</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Compensation */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-10 border border-slate-50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Compensation</h3>
              </div>
              <div className="max-w-md space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Annual Salary (USD)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 pl-10 focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800" 
                    placeholder="85,000"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-6 pt-6">
              <button 
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-300 active:scale-95"
              >
                Cancel & Discard
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-primary shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    <span>Add Employee</span>
                    <Check size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Information Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-100/50 rounded-3xl p-8 flex items-start gap-6 border border-slate-100">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
              <Info size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Data Verification</h4>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">Employee details will be sent for background verification once submitted.</p>
            </div>
          </div>
          <div className="bg-slate-100/50 rounded-3xl p-8 flex items-start gap-6 border border-slate-100">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Privacy Standards</h4>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">This record complies with GDPR and organization data retention policies.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
