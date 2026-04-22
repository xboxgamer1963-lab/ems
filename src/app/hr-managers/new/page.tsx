'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Building2, 
  ShieldCheck,
  Check,
  Loader2,
  Info
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function AddHRPage() {
  const { profile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dept: 'Human Resources',
    role: 'hr',
    permissions: 'Senior HR Manager',
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
        setTimeout(() => router.push('/hr-managers'), 2000);
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
      
      <main className="max-w-[1280px] mx-auto py-12 px-8 w-full animate-fade-in">
        {/* Breadcrumbs & Title Section */}
        <div className="mb-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary mb-4 group hover:underline"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest">Back to Directory</span>
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Create HR Profile</h2>
          <p className="text-lg font-medium text-slate-500 max-w-2xl mt-1">
            Register a new HR Manager to the platform. They will be granted access to employee records and departmental payroll based on their permissions.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-10 border border-slate-50">
              {success ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Profile Created!</h3>
                  <p className="text-lg font-medium text-slate-500">The HR Manager has been invited. Redirecting...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          required
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800" 
                          placeholder="e.g. Sarah Jenkins" 
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          required
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800" 
                          placeholder="sarah.j@company.com" 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Organizational Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">Department</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select 
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800 appearance-none"
                          value={formData.dept}
                          onChange={(e) => setFormData({...formData, dept: e.target.value})}
                        >
                          <option>Human Resources</option>
                          <option>Operations</option>
                          <option>Finance & Payroll</option>
                          <option>Talent Acquisition</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Role/Permissions</label>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsCustomRole(!isCustomRole);
                            if (!isCustomRole) setFormData({...formData, permissions: ''});
                            else setFormData({...formData, permissions: 'Senior HR Manager'});
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                        >
                          {isCustomRole ? 'Select from list' : 'Manual Entry'}
                        </button>
                      </div>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        {isCustomRole ? (
                          <input 
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800" 
                            placeholder="Enter custom role" 
                            type="text"
                            value={formData.permissions}
                            onChange={(e) => setFormData({...formData, permissions: e.target.value})}
                          />
                        ) : (
                          <select 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-primary focus:bg-white transition-all duration-300 font-bold text-slate-800 appearance-none"
                            value={formData.permissions}
                            onChange={(e) => setFormData({...formData, permissions: e.target.value})}
                          >
                            <option>Senior HR Manager</option>
                            <option>HR Specialist</option>
                            <option>Recruitment Lead</option>
                            <option>Payroll Auditor</option>
                            <option>Employee Relations</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] font-bold text-slate-400 max-w-xs leading-relaxed">
                      By creating this account, the user will receive an automated invitation email to set their password.
                    </p>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <button 
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 md:flex-none px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-300"
                      >
                        Discard
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 md:flex-none px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-primary shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Manager'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
              <div className="flex items-center gap-3 mb-6">
                <Info className="text-primary" size={20} />
                <h3 className="text-xs font-black text-primary uppercase tracking-widest">Quick Guidelines</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <Check className="text-primary mt-1 shrink-0" size={16} />
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">Managers can only access departments they are assigned to.</p>
                </li>
                <li className="flex gap-4">
                  <Check className="text-primary mt-1 shrink-0" size={16} />
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">Email must be a verified corporate address.</p>
                </li>
                <li className="flex gap-4">
                  <Check className="text-primary mt-1 shrink-0" size={16} />
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">Permissions can be audited from the logs section later.</p>
                </li>
              </ul>
            </div>

            <div className="relative h-64 rounded-[2.5rem] overflow-hidden shadow-xl group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP_sFu2pleyt6XVed9f1Oww7JPxctpmxkCDZdxTlO1RGUPa0bXVMQWiIAiMGCqwZjNH4D9KL1ggKiyOQywhH-DXzxxktxYzQz9MxVWGjNy83fTYRtOyNJnQo3tb7yhOYXreQ600m-86KUrGj3nI2T9QcJbo-T-bRCvCBJWygrhoYTeb7R8glTEBwALchZNkvoc_sc-LRa8jGpAOngCIlRYcyqnGAOlSf69kNLoJR66PzjX5Pzww6ULZ-KF9S7kv_nKSXoO1t4T1lA" 
                alt="Workspace" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <p className="text-white text-2xl font-black tracking-tight">Our Workspace</p>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Empowering people through design.</p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 flex items-center justify-between border border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active HR Team</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">12 Managers</p>
              </div>
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                <User size={24} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
