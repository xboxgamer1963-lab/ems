'use client';

import Link from 'next/link';
import '@/app/landing.css';

export default function LandingPage() {
  return (
    <div className="landing-root bg-background font-manrope antialiased">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight">Emply</Link>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-primary font-semibold border-b-2 border-primary hover:text-primary transition-all duration-300" href="#">Features</a>
            <a className="text-slate-600 font-medium hover:text-primary transition-all duration-300" href="#">Solutions</a>
            <a className="text-slate-600 font-medium hover:text-primary transition-all duration-300" href="#">Pricing</a>
            <a className="text-slate-600 font-medium hover:text-primary transition-all duration-300" href="#">About</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="px-5 py-2 text-slate-600 font-medium hover:text-primary transition-colors active:scale-95">Login</Link>
            <Link href="/auth/signup" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-transform active:scale-95">Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-semibold">
              <span className="material-symbols-outlined mr-2 text-[18px]">auto_awesome</span>
              Introducing Emply 2.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-on-background leading-[1.1] tracking-tighter">
              Manage your workforce with <span className="text-primary">unparalleled clarity</span>
            </h1>
            <p className="text-lg lg:text-xl text-secondary max-w-lg leading-relaxed">
              The breezy employee management system designed for modern teams. Streamline HR, payroll, and performance tracking in one unified workspace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup" className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all text-center">
                Start Your Journey
              </Link>
              <button className="px-8 py-4 bg-white text-primary border-2 border-primary/10 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                <span className="material-symbols-outlined">play_circle</span>
                Watch Product Tour
              </button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-slate-400 text-sm font-medium">
              <div className="flex -space-x-2">
                <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6t8JzhEWamh7Nu767wlCpR7PlIvJ9a_wCtFowA5AoK4dsKwfKoovtAuWSdhLp0D0eTfTcPohTHo_oOqIf5ygdLEMVBxUR7Zf39mkdUYxcxzwtckrh-c1bb3HALN3Hbm7OipKD17T2J7R0JmLzEXjoVIYHimBE60IoJfeRaZdv5Rg-1KmABKSmEPHJEa3Zek1pQzeRW7E67IF7sRkt6ToT4VuMiFGYbbuTzE4fPDsn1d5nXTG28s0QvyWNhDE5NdVVBIul_baBllY" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqwW5ZVk1GDqVaVh8JxLR1_UjJEjSvmbNWjdpvvZb1NAeWsqxNhwrbqdbX9mDCtNpS-Gf-FpRpvR-NgE6TKA4mxsqHPyWMDjE70LK0Q8IYzNneKhc9t-snRb6youJWTg28w3FSMAoPSxnHCnoznofyS1gB065a65BbMTYw_Tljau6Ty-qZjXo78mqAFeFQNWGCC74GDtuZQc6T-7GQG-cq3Uk_b0-sB6U5UzdXfM4axc6Ukryl0blU_vPPtjX8a28qSi4s75wt3Zw" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDok-4fal9pHW8oij4LaSABvR5mnMGLV0TzX6GgINb3IKypa8YCdp9KTKl3VoCtveQpgReY4HKglksj9_6LuPC7yjN_I0zA7uVEdi3r9xlkJzpQvASYfXnh31syEtKE6IwAAaepz0vSXuJidHSzTLKAkQGttKZv0Z_UPeTay9XdpA9UMEFvpTX6LezHPr6lcRc66fTAuOuBwyxLLbjoHVtvS2JQazN54uFFfp354BRXDxgMpZn-C-IzZc1nZhpNQMFYsbivyc7-FxE" alt="User" />
              </div>
              <span>Joined by 10,000+ teams worldwide</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img className="w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbbmcVaqhr8TutKJfFmyGqwY5K1GYwf-d3uNOffV9ytqVbEhh_3mrElKAZRJ0YBdEuDTCIhi0wJOevGpErgtdQZ4tqxSUc1QpbTRE2at_31P8nT9QeH5mKSxZqzjonEbDgnF1tcucJ4BMPtr8XtDGD7Cr9L1YuMGJICdtmPbKQ9bZVThFj0QyGCMyPK96NX1SOYlXKZqyidPPfrfbxnW9ivSY9ggB4JT_eVQclv-Tw4q9czt3mXMpu-uH1Up2Td0_CZMEOi94Mbaw" alt="Emply Dashboard" />
            </div>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold text-on-background tracking-tight">Everything you need, nothing you don't</h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">Focus on what matters—your people. Emply removes the friction from day-to-day management.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:translate-y-[-8px] transition-all duration-300 border border-slate-50 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Centralized Directory</h3>
              <p className="text-secondary leading-relaxed font-medium">Keep all employee records, documents, and emergency contacts in one secure, breezy location.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:translate-y-[-8px] transition-all duration-300 border border-slate-50 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Seamless Payroll</h3>
              <p className="text-secondary leading-relaxed font-medium">Automate tax filings, benefits, and salary payments with local compliance built right into the core.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:translate-y-[-8px] transition-all duration-300 border border-slate-50 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Insightful Reports</h3>
              <p className="text-secondary leading-relaxed font-medium">Track turnover, diversity, and department growth with automated visual dashboards that tell the story.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bento-grid">
            {/* Bento Item 1 */}
            <div className="col-span-12 md:col-span-7 bg-surface-container-low rounded-[2rem] p-12 flex flex-col justify-between overflow-hidden relative border border-slate-100 italic transition-all hover:bg-white hover:shadow-xl duration-500">
              <div className="relative z-10">
                <span className="text-primary font-black text-xs uppercase tracking-widest mb-4 block">Performance Tracking</span>
                <h3 className="text-4xl font-extrabold mb-6 max-w-md tracking-tight leading-tight">Cultivate talent through continuous feedback</h3>
                <p className="text-secondary max-w-sm mb-10 text-lg">Set OKRs, schedule 1-on-1s, and provide real-time recognition without the heavy lifting.</p>
                <button className="bg-primary text-on-primary px-8 py-3 rounded-[1rem] font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Explore Performance</button>
              </div>
              <div className="absolute bottom-[-10%] right-[-5%] w-1/2 h-2/3 rounded-tl-[3rem] bg-white shadow-2xl rotate-[-5deg] overflow-hidden border-8 border-white p-2">
                <img className="w-full h-full object-cover rounded-tl-[2.5rem] opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCovYukR1vPEBQ-KI9vl107qAoF2K0c_iMkmwDVI6UfJbG05p-P5ePLuxva5dXVUHGA0dcSIjt0joNTFVsrybcjYUA9ujJhR2w2XMoesA3CVxg-rAdd9P9j8AbEQnxI5w9kIvCKcxTRbudzt6myfV8YCBs9hcJtKpqEYSfXecOwcSc35_gWZTiUrMhS1srjzKhg5gan0OwNykqiJs2vcYgW3bBLdnG_cRn1uKOSOAjPrDM8lqfQSxLiLVsZnJEnGDZLZCrAZllf69Q" alt="Performance interface" />
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="col-span-12 md:col-span-5 bg-primary/5 rounded-[2rem] p-12 flex flex-col justify-center items-center text-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <span className="material-symbols-outlined text-[80px] text-primary mb-8" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <h3 className="text-3xl font-black mb-4 tracking-tight">Enterprise-Grade Security</h3>
              <p className="text-secondary text-lg">SOC2, GDPR, and HIPAA compliant. Your data is encrypted and secure at every step.</p>
            </div>

            {/* Bento Item 3 */}
            <div className="col-span-12 md:col-span-4 bg-secondary-container rounded-[2rem] p-12 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-black mb-4 tracking-tight">Automated Workflows</h3>
              <p className="text-on-secondary-container/80 mb-8 font-medium">Create custom triggers for onboarding, offboarding, and role changes.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/40 shadow-sm">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span className="text-sm font-bold text-slate-800">New Hire Document Upload</span>
                </div>
                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white/40 shadow-sm">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span className="text-sm font-bold text-slate-800">Equipment Provisioning</span>
                </div>
              </div>
            </div>

            {/* Bento Item 4 */}
            <div className="col-span-12 md:col-span-8 bg-slate-50/50 rounded-[2rem] p-12 flex flex-col md:flex-row items-center gap-12 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-4 tracking-tight">Breezy Time Tracking</h3>
                <p className="text-secondary mb-8 text-lg font-medium leading-relaxed">Simple punch-in, PTO management, and timesheet approvals that employees actually love.</p>
                <div className="flex gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center flex-1 border border-slate-50">
                    <div className="text-primary font-black text-3xl mb-1">4.9/5</div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">App Store</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center flex-1 border border-slate-50">
                    <div className="text-primary font-black text-3xl mb-1">100%</div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">Accuracy</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <img className="rounded-2xl shadow-2xl border-4 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwiQXqKgRxRa4Y7YVIuI3S7T9IdNo94cNkLpf9SSWdJnSP1awH--npKQc0Rt53rlqz3ef6Qq-9GfwumeY_zHGyI67EN6xTecRat9B8nb4HgYtFygS6epwA-XlXvlUMpNDwnmW8NAeMLAiA1qpCrANHi7z7kfAjE43bITngeIvG_YcA2imGc2CRHr1joQRHEFY0_waNxKa_GzWEMKOp-v2OVzd9j_uM_WO5ENjMhTdtPXvzm-Oll1Odnkhw8YNkbUQYKueah16RHl8" alt="Team collaborating" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight">Simple, scalable pricing</h2>
            <p className="text-lg text-secondary">No hidden fees. Change your plan at any time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Basic Plan */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:scale-[1.02] transition-transform duration-300">
              <h3 className="font-extrabold text-2xl mb-2">Basic</h3>
              <div className="mb-8 flex items-baseline">
                <span className="text-5xl font-black text-on-background">$8</span>
                <span className="text-slate-400 font-bold ml-2">/user/mo</span>
              </div>
              <p className="text-slate-500 mb-10 font-medium">For small teams getting started with HR automation.</p>
              <ul className="space-y-6 mb-10">
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Employee Directory
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Document Management
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Basic Reporting
                </li>
              </ul>
              <button className="w-full py-4 rounded-2xl border-2 border-primary/20 text-primary font-black hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95">Choose Basic</button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-4 border-primary relative transform scale-110 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">Most Popular</div>
              <h3 className="font-extrabold text-2xl mb-2">Pro</h3>
              <div className="mb-8 flex items-baseline">
                <span className="text-5xl font-black text-on-background">$15</span>
                <span className="text-slate-400 font-bold ml-2">/user/mo</span>
              </div>
              <p className="text-slate-500 mb-10 font-medium">Comprehensive tools for growing organizations.</p>
              <ul className="space-y-6 mb-10">
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Everything in Basic
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Full Payroll Suite
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Performance Reviews
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Automated Workflows
                </li>
              </ul>
              <button className="w-full py-4 rounded-2xl bg-primary text-on-primary font-black shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all">Choose Pro</button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 hover:scale-[1.02] transition-transform duration-300">
              <h3 className="font-extrabold text-2xl mb-2">Enterprise</h3>
              <div className="mb-8">
                <span className="text-5xl font-black text-on-background">Custom</span>
              </div>
              <p className="text-slate-500 mb-10 font-medium">Advanced controls and support for large scale teams.</p>
              <ul className="space-y-6 mb-10">
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Custom SSO & SAML
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  Dedicated Account Manager
                </li>
                <li className="flex items-center gap-4 text-sm font-bold text-slate-700">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-lg">check</span>
                  API Access & Webhooks
                </li>
              </ul>
              <button className="w-full py-4 rounded-2xl border-2 border-primary/20 text-primary font-black hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <h2 className="text-5xl font-black tracking-tight leading-tight">What teams are saying about Emply</h2>
              <p className="text-xl text-secondary leading-relaxed">Join thousands of HR leaders who have transformed their company culture with our breezy management tool.</p>
              <div className="flex gap-4">
                <button className="w-16 h-16 rounded-full border-2 border-slate-100 hover:border-primary flex items-center justify-center text-slate-300 hover:text-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">arrow_back</span>
                </button>
                <button className="w-16 h-16 rounded-full border-2 border-slate-100 hover:border-primary flex items-center justify-center text-slate-300 hover:text-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-primary/[0.03] backdrop-blur-xl p-16 rounded-[4rem] relative z-10 border border-slate-100 shadow-sm">
                <div className="text-primary mb-12">
                  <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                </div>
                <p className="text-2xl font-semibold mb-12 leading-relaxed text-on-background italic">
                  "Emply has completely revolutionized how we handle our remote onboarding. What used to take days of paperwork now happens in minutes. Our employees love the interface!"
                </p>
                <div className="flex items-center gap-6">
                  <img className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLIBz6t5eD4fCn8ak5D7pEnOQdNqjyZhvxPddFrzgvadoUnlbSM2LwpruPe4Y6LLudYOhhbDFjtbElJBFqg4yA5heTFQxx9wmH2elIr-s_sPiR9nxc3WjNjNGTHDJtMK5hBW-5ZSknuDW1kUcczlaWQlmSzjd24XmDu3my0ty6u0oxSji2RYoz0dzEVf8odmNg04sHFcoX-uj6WJHoeqaVz42YNGmXPeUDJ7D2GgrceDTszOyBUlDqFCTO5cSGNTIyju_-ECZ1PyU" alt="Sarah Jenkins" />
                  <div>
                    <h4 className="font-extrabold text-xl">Sarah Jenkins</h4>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Director of People, TechFlow</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-full h-full bg-primary/5 rounded-[4rem] -z-10 rotate-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-20 font-manrope text-sm text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-3xl font-black text-white tracking-tighter">Emply</div>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
              Building the future of workplace management with empathy and design-first thinking.
            </p>
            <p className="text-slate-500 font-bold">© 2024 Emply Systems Inc. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6 justify-start md:justify-end">
            <a className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]" href="#">Terms of Service</a>
            <a className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]" href="#">Security</a>
            <a className="hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
