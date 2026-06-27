'use client';

import { redirect } from 'next/navigation';

export default function AdminContactsRedirect() {
  redirect('/admin/contact-messages');
}
