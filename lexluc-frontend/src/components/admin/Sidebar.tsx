'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Services', href: '/admin/services', icon: '🛠️' },
  { label: 'Tours', href: '/admin/tours', icon: '🗺️' },
  { label: 'Bookings', href: '/admin/bookings', icon: '📅' },
  { label: 'Blog Posts', href: '/admin/blog', icon: '📝' },
  { label: 'Contact Messages', href: '/admin/contact-messages', icon: '💬' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        {!isCollapsed && <h1 className="text-xl font-bold">Lexluc Admin</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-800 rounded"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-8 px-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <p className={`text-xs text-gray-400 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && 'Lexluc © 2025'}
        </p>
      </div>
    </aside>
  );
}
