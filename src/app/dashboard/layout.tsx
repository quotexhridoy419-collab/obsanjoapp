'use client';

import type { ReactNode } from 'react';
import BottomNav from '@/components/BottomNav';
import { AuthProvider, useAuth } from '@/hooks/use-auth.tsx';
import Loader from '@/components/ui/loader';

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // The AuthProvider handles redirection logic.
  // We show a loader only if the user object is not yet available,
  // which also covers the case where the user is not logged in
  // and is about to be redirected.
  if (!user) {
    return <Loader />;
  }

  return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-grow pb-20">{children}</main>
        <BottomNav />
      </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}