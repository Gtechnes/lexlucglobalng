'use client';

import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getStoredUser } from '@/lib/auth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Don't protect the login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const user = getStoredUser();
    if (!user && !isLoginPage) {
      router.push('/admin/login');
      setIsCheckingAuth(false);
    } else {
      setIsAuthorized(true);
      setIsCheckingAuth(false);
    }
  }, [router, isLoginPage]);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Login page doesn't need the sidebar and header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Protected pages require authentication
  if (!isAuthorized) {
    return null;
  }

  // Render protected pages with sidebar and header
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="ml-64">
        <AdminHeader />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
