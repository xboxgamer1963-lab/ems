'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useAuth } from '@/providers/AuthProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthPage = pathname?.startsWith('/auth');
  const isLandingPage = pathname === '/' && !user;

  return (
    <div className={`flex flex-col min-h-screen ${isAuthPage || isLandingPage ? 'auth-layout' : ''}`}>
      <div className="flex flex-1">
        {(!isAuthPage && !isLandingPage) && <Sidebar />}
        <main className="main-content-wrapper flex flex-col flex-1">
          <div className="flex-1">
            {children}
          </div>
          {(!isAuthPage && !isLandingPage) && <Footer />}
        </main>
      </div>
    </div>
  );
}
