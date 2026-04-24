'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    orgName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed');
      if (authData.user.identities && authData.user.identities.length === 0) {
        throw new Error('This email is already registered. Please log in instead.');
      }

      // Create organization
      const baseSlug = formData.orgName.toLowerCase().replace(/\s+/g, '-');
      const uniqueSuffix = Date.now().toString(36);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: formData.orgName, slug })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          role: 'admin',
          organization_id: orgData.id,
        });

      if (profileError) throw profileError;

      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-stretch overflow-hidden font-manrope">
      {/* Left Side: Visual/Branding */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlvkSogvVdz8KCGDiDmfcuqXqwiwCs_jgQbdXz0dkS7raAXDKqnT_7NPeIWCa4oGhtM4AQ8KF6f8jDc0Pe1HhvIKeaWYLTKgR9iXIDXF56NL_8BxBnRCl-GhyWcSihBe0YgMweevZPUcaITSTcg-0smHO2-hHfBE8vM9trwRQZKw7PfPALXo7TudnXFPinXjYc4ixb8WjoZTV--eTH7LEWbk0kwTNtxb3702Rvv2PDrLnnw4iHp6aq84q1-K-f6a8MavmicwarikQ" 
            alt="Emply Teamwork" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 image-overlay"></div>
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
            <h1 className="text-3xl font-extrabold tracking-tighter">Emply</h1>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-extrabold mb-6 leading-[1.1] tracking-tighter">Empower your team's collective growth.</h2>
          <p className="text-xl opacity-90 leading-relaxed font-medium">Join thousands of enterprises streamlining their HR, payroll, and employee management with our soft-minimalist ecosystem.</p>
          
          <div className="mt-10 flex gap-6">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-2 flex-1 border border-white/10">
              <span className="text-3xl font-black">100+</span>
              <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Active Employees</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-2 flex-1 border border-white/10">
              <span className="text-3xl font-black">99.9%</span>
              <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Uptime Rate</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            <img className="h-10 w-10 rounded-full border-2 border-white shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwyxdDspbnsAOzQ-EO7OuuvaCVLbr-qdkeejXSCXwJRZfpsmvD7BY6kuS-e7IofXQDSMXanb3QtwNkZCQxA-zcfWzWotnWVC2_IzVK8ZzS4k5t_K00ucQrZCqVizQH3bAEIoyR69ns6yKsPd_NLUeS7OuFduUoUxXLyq1OrJkJI5iosenZWC1aJguVMToEK6SASk0sep-hMo6v0ssFWQlcI4yRj1QL1_9rf_8BJy1yOgxD4M0QCK0Q20fy3T4LAW4Xn68pShxTMRg" alt="User" />
            <img className="h-10 w-10 rounded-full border-2 border-white shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2Z7F6WUDLuMcPF2Q3332VX0Xl9aR8W_mmsEBLGNV0w6kZLUL9V0Dv-iGIseGz7ioXlRkVgK3FUC5AX9ruXpl40CC2Vt-URjSp22ERjDzGwVc1FDSr9BcTuSWQce7xJMko3zcQLrEY9MraWGQ4dSin2zqF0IGX-RQUKtRzVpGotxqXQRjrTJ6Xo-JkE61K4mKWyTwLliJZ9mS_SDKLPubw-NtWVw2OEx8K2_fs8q3fgEKg99U5Wais-OepI1MUpblyGGK1TEs3t8k" alt="User" />
            <img className="h-10 w-10 rounded-full border-2 border-white shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLWQLpnLdla0mOzncX603m4WMRctQNeCQWowqNBswXBUNiGByRJi0Vb05q2rgZ4ZxY_IvTx2Fdyt4In5pjuxL8ROvcexm5syDz-B9-qcY5pPiUNlsPw2DUPEdeWBNWNc7VdhU0oOmKuZiMqmpzjUwm6sXL98ZTDrO8uyysV3TUV2I8WlLNSol8J_c3tW1p0cVT6eAQkw6lDxlYe4l2SrAypngSjkKs5SvJYodUshAE-igvOQUe0hydq_Wn0mYhp_ob0G5F9n3x3kM" alt="User" />
          </div>
          <p className="text-sm font-bold tracking-tight">Trusted by world-class leaders</p>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 bg-surface overflow-y-auto">
        <div className="w-full max-w-[480px] animate-fade-in">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-4xl font-black text-on-background tracking-tighter mb-2">Create your account</h3>
            <p className="text-lg font-medium text-secondary">Get started with Emply today.</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400" htmlFor="name">Full Name</label>
                <input 
                  className="w-full h-14 px-6 bg-white border-2 border-transparent rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all duration-300 auth-card-shadow font-bold text-slate-800" 
                  id="name" 
                  placeholder="John Doe" 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400" htmlFor="company">Company Name</label>
                <input 
                  className="w-full h-14 px-6 bg-white border-2 border-transparent rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all duration-300 auth-card-shadow font-bold text-slate-800" 
                  id="company" 
                  placeholder="Acme Inc." 
                  type="text" 
                  required
                  value={formData.orgName}
                  onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400" htmlFor="email">Work Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                <input 
                  className="w-full h-14 pl-14 pr-6 bg-white border-2 border-transparent rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all duration-300 auth-card-shadow font-bold text-slate-800" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                <input 
                  className="w-full h-14 pl-14 pr-6 bg-white border-2 border-transparent rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all duration-300 auth-card-shadow font-bold text-slate-800" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-error p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-error" />
                {error}
              </div>
            )}

            <div className="pt-4">
              <button 
                className="w-full h-14 bg-primary text-on-primary font-black rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Register Organization</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle */}
          <div className="mt-10 text-center">
            <p className="font-bold text-secondary">
              Already have an account? 
              <Link className="text-primary font-black hover:underline ml-2" href="/auth/login">Login</Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-12 text-center">
            <p className="text-[11px] font-bold text-slate-400 px-6 leading-relaxed">
              By registering, you agree to our 
              <Link className="underline mx-1 text-slate-500" href="#">Terms of Service</Link> and 
              <Link className="underline mx-1 text-slate-500" href="#">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Accessibility / UI Note */}
      <div className="fixed bottom-8 right-8">
        <button className="bg-white p-4 rounded-full shadow-2xl text-primary hover:bg-primary hover:text-white transition-all duration-500 flex items-center justify-center border border-slate-100 group" title="Help Center">
          <span className="material-symbols-outlined text-[24px]">help_outline</span>
        </button>
      </div>
    </main>
  );
}
