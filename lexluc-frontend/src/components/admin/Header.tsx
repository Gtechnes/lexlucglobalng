'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, removeAuthToken } from '@/lib/auth';

export default function AdminHeader() {
  const router = useRouter();
  const user = getStoredUser();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/admin/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {/* Dynamic title will be set by child pages */}
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <span className={`transition-transform ${showMenu ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg border-t border-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
