'use client';

import React from 'react';
import { useToast } from '@/lib/hooks';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg text-white font-semibold shadow-lg animate-fadeIn ${getToastColor(toast.type)}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function getToastColor(type: string): string {
  switch (type) {
    case 'success':
      return 'bg-green-600';
    case 'error':
      return 'bg-red-600';
    case 'warning':
      return 'bg-yellow-600';
    case 'info':
    default:
      return 'bg-blue-600';
  }
}
