'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/auth') && pathname !== '/') {
      router.push('/auth/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-height-screen w-full bg-background animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading EMS Pro...</p>
        </div>
      </div>
    );
  }

  // If in auth pages or home page, just show children
  if (pathname.startsWith('/auth') || pathname === '/') {
    return <>{children}</>;
  }

  // If not logged in and not in auth pages/home, don't show anything (redirecting)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
