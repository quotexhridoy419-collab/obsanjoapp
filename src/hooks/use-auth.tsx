'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import Loader from '@/components/ui/loader';

const unprotectedRoutes = ['/', '/signup'];
const adminRoutesPrefix = '/admin';

interface User {
  id: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, refetchUser: () => {} });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserData = useCallback(async (userId: string) => {
    const userRef = ref(db, `users/${userId}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUser({ id: userId, ...snapshot.val() });
      } else {
        localStorage.removeItem('loggedInUserId');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('loggedInUserId');
      setUser(null);
    }
  }, []);

  const refetchUser = useCallback(() => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      fetchUserData(loggedInUserId);
    }
  }, [fetchUserData]);

  useEffect(() => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      // Fetch user data but don't show a full-screen loader
      // The UI will update once the user data is available.
      fetchUserData(loggedInUserId);
    }
  }, [fetchUserData]);

  useEffect(() => {
    // This effect handles redirection logic.
    const isUnprotected = unprotectedRoutes.includes(pathname) || pathname.startsWith('/signup');
    const isAdminRoute = pathname.startsWith(adminRoutesPrefix);

    const loggedInUserId = localStorage.getItem('loggedInUserId');
    
    // If user is logged in and on an unprotected page, redirect to dashboard.
    if (loggedInUserId && isUnprotected) {
      router.replace('/dashboard');
    }
    
    // If user is not logged in and on a protected page, redirect to login.
    if (!loggedInUserId && !isUnprotected && !isAdminRoute) {
      router.replace('/');
    }
  }, [pathname, router]);

  const value = { user, refetchUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}