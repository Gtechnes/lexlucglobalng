'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBookingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/tour-bookings');
  }, [router]);

  return null;
}

