'use client';

import { ComponentType, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { contactsAPI } from '@/lib/api';
import { useFetch, useMutation, useToast } from '@/lib/hooks';
import { ContactMessage, ContactStatus } from '@/types';
import { Button, Card, Textarea, Badge } from '@/components/common/UI';
import { ArrowLeft, Mail, Phone, Building2, Calendar, MessageSquareReply, CheckCircle2, Trash2 } from 'lucide-react';

const statusOptions: ContactStatus[] = ['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED'];

export default function ContactMessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [replyText, setReplyText] = useState('');

  const { data: message, loading, refetch } = useFetch<ContactMessage>(() => contactsAPI.getOne(params.id as string), [params.id]);
  const replyMutation = useMutation<ContactMessage, { response: string }>((payload) => contactsAPI.respond(params.id as string, payload.response));
  const statusMutation = useMutation<ContactMessage, { status: ContactStatus }>((payload) => contactsAPI.updateStatus(params.id as string, payload.status));
  const closeMutation = useMutation<ContactMessage, void>(() => contactsAPI.close(params.id as string));
  const deleteMutation = useMutation<void, void>(() => contactsAPI.delete(params.id as string));

  if (loading) return <Card className="p-8">Loading message...</Card>;
  if (!message) return <Card className="p-8">Message not found</Card>;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showError('Reply cannot be empty');
      return;
    }
    try {
      await replyMutation.mutate({ response: replyText.trim() });
      success('Reply saved and inquiry marked as responded');
      setReplyText('');
      refetch();
    } catch (err) {
      showError((err as Error).message || 'Failed to save reply');
    }
  };

  const handleStatusChange = async (status: ContactStatus) => {
    try {
      await statusMutation.mutate({ status });
      success(`Status updated to ${status}`);
      refetch();
    } catch (err) {
      showError((err as Error).message || 'Failed to update status');
    }
  };

  const handleDelete = () => {
    if (!confirm('Delete this contact message permanently?')) return;
    deleteMutation.mutate()
      .then(() => {
        success('Message deleted');
        router.push('/admin/contact-messages');
      })
      .catch((err) => showError((err as Error).message || 'Failed to delete message'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/contact-messages" className="inline-flex items-center text-blue-700 font-semibold hover:text-blue-900">
          <ArrowLeft size={18} className="mr-2" />Back to Messages
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => window.history.back()}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{message.subject}</h1>
                <p className="text-gray-500 mt-2">Submitted {new Date(message.createdAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={message.status} isRead={message.isRead} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <DetailItem label="Full Name" value={message.fullName} />
              <DetailItem label="Email" value={message.email} />
              {message.phone && <DetailItem label="Phone" value={message.phone} />}
              {message.company && <DetailItem label="Company" value={message.company} />}
            </div>

            <div>
              <h2 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">Message</h2>
              <div className="rounded-2xl bg-gray-50 p-6 text-gray-800 whitespace-pre-wrap leading-relaxed">{message.message}</div>
            </div>

            {message.response && (
              <div className="mt-8">
                <h2 className="text-sm uppercase tracking-wide text-green-700 font-semibold mb-3">Admin Reply</h2>
                <div className="rounded-2xl bg-green-50 p-6 text-green-900 whitespace-pre-wrap leading-relaxed">{message.response}</div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="grid gap-3">
              <Button onClick={() => document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' })}><MessageSquareReply size={18} className="mr-2" />Reply</Button>
              <select value={message.status} onChange={(e) => handleStatusChange(e.target.value as ContactStatus)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500">
                {statusOptions.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
              </select>
              <Button variant="ghost" onClick={() => closeMutation.mutate().then(() => refetch()).catch((err) => showError((err as Error).message || 'Failed to close inquiry'))}><CheckCircle2 size={18} className="mr-2" />Close Inquiry</Button>
              <Button variant="danger" onClick={handleDelete}><Trash2 size={18} className="mr-2" />Delete Message</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Contact</h2>
            <div className="space-y-4 text-sm">
              <InfoRow icon={Mail} label="Email" value={message.email} />
              {message.phone && <InfoRow icon={Phone} label="Phone" value={message.phone} />}
              {message.company && <InfoRow icon={Building2} label="Company" value={message.company} />}
              <InfoRow icon={Calendar} label="Submitted" value={new Date(message.createdAt).toLocaleString()} />
            </div>
          </Card>

          <form id="reply-form" onSubmit={handleReply} className="space-y-4">
            <Textarea label="Reply" value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={7} required />
            <Button type="submit" loading={replyMutation.loading} className="w-full"><MessageSquareReply size={18} className="mr-2" />Save Reply</Button>
          </form>
        </motion.aside>
      </div>
    </div>
  );
}

function StatusBadge({ status, isRead }: { status: ContactStatus; isRead: boolean }) {
  const variants: Record<ContactStatus, 'warning' | 'info' | 'success' | 'default'> = {
    NEW: 'warning',
    IN_PROGRESS: 'info',
    RESPONDED: 'success',
    CLOSED: 'default',
  };
  return <Badge variant={variants[status]}>{isRead ? status.replace('_', ' ') : `${status.replace('_', ' ')} · Unread`}</Badge>;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
      <p className="text-gray-900 mt-1 break-words">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string; size?: number }>; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="text-blue-600 mt-0.5 flex-shrink-0" size={17} />
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
        <p className="text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}
