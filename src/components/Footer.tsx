'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-slate-50 border-t border-slate-100 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <p className="text-lg font-black text-slate-900 mb-2 tracking-tighter">Emply</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            © 2026 Emply Systems Inc. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-8">
          <Link className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors" href="#">Privacy Policy</Link>
          <Link className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors" href="#">Terms of Service</Link>
          <Link className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors" href="#">Security</Link>
          <Link className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors" href="#">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
