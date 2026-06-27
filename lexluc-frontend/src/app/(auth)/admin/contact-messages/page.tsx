'use client';

import { ComponentType, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { contactsAPI } from '@/lib/api';
import { useFetch, useMutation, useToast } from '@/lib/hooks';
import { ContactMessage, ContactStatus } from '@/types';
import { Badge, Button, Card, Modal, Textarea } from '@/components/common/UI';
import {
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  ArrowUpDown,
  RefreshCcw,
  MessageSquareReply,
  Mail,
  Clock,
  Phone,
  Building2,
  Calendar,
  Inbox,
} from 'lucide-react';

const statusOptions: { value: ContactStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESPONDED', label: 'Responded' },
  { value: 'CLOSED', label: 'Closed' },
];

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc', label: 'Oldest first' },
  { value: 'fullName-asc', label: 'Name A-Z' },
  { value: 'subject-asc', label: 'Subject A-Z' },
  { value: 'status-asc', label: 'Status' },
];

export default function ContactMessagesPage() {
  const { success, error: showError } = useToast();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | ContactStatus>('all');
  const [sort, setSort] = useState('createdAt-desc');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const fetchContacts = useCallback(() => {
    const [sortField, sortDir] = sort.split('-') as [ContactMessage['createdAt' | 'updatedAt' | 'fullName' | 'email' | 'subject' | 'status'], 'asc' | 'desc'];
    return contactsAPI.getAll({
      page: String(page),
      limit: String(limit),
      status: status === 'all' ? undefined : status,
      search: search.trim() || undefined,
      sort: sortField,
      sortDir,
    });
  }, [page, status, search, sort]);

  const { data, loading, refetch } = useFetch(fetchContacts, [fetchContacts]);
  const messages = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta || { total: 0, page: 1, limit, totalPages: 1 };

  const { data: stats } = useFetch(contactsAPI.getStats, []);

  const replyMutation = useMutation<ContactMessage, { response: string }>((payload) =>
    selected ? contactsAPI.respond(selected.id, payload.response) : Promise.reject(new Error('No message selected')),
  );

  const statusMutation = useMutation<ContactMessage, { status: ContactStatus }>((payload) =>
    selected ? contactsAPI.updateStatus(selected.id, payload.status) : Promise.reject(new Error('No message selected')),
  );

  const closeMutation = useMutation<ContactMessage, void>(() => (selected ? contactsAPI.close(selected.id) : Promise.reject(new Error('No message selected'))));
  const deleteMutation = useMutation<void, void>(() => (selected ? contactsAPI.delete(selected.id) : Promise.reject(new Error('No message selected'))));

  const openDetails = async (message: ContactMessage) => {
    setSelected(message);
    if (!message.isRead) {
      try {
        await contactsAPI.markAsRead(message.id);
        refetch();
      } catch {
        showError('Failed to mark message as read');
      }
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showError('Reply cannot be empty');
      return;
    }
    try {
      await replyMutation.mutate({ response: replyText.trim() });
      success('Reply saved and status marked as responded');
      setReplyText('');
      setReplyOpen(false);
      refetch();
    } catch (err) {
      showError((err as Error).message || 'Failed to save reply');
    }
  };

  const handleStatusChange = async (newStatus: ContactStatus) => {
    try {
      await statusMutation.mutate({ status: newStatus });
      success(`Status updated to ${newStatus}`);
      refetch();
    } catch (err) {
      showError((err as Error).message || 'Failed to update status');
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutate();
      success('Inquiry closed');
      refetch();
    } catch (err) {
      showError((err as Error).message || 'Failed to close inquiry');
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!confirm('Delete this contact message permanently?')) return;
    deleteMutation.mutate()
      .then(() => {
        success('Message deleted');
        setSelected(null);
        refetch();
      })
      .catch((err) => showError((err as Error).message || 'Failed to delete message'));
  };

  const selectedUpdated = useMemo(() => {
    if (!selected) return null;
    return messages.find((message) => message.id === selected.id) || selected;
  }, [selected, messages]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">Manage website inquiries, mark responses, and close resolved conversations.</p>
        </div>
        <Button variant="ghost" onClick={() => refetch()}><RefreshCcw size={18} className="mr-2" />Refresh</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats?.total || 0, icon: Inbox, className: 'bg-blue-50 text-blue-700' },
          { label: 'New', value: stats?.new || 0, icon: Mail, className: 'bg-amber-50 text-amber-700' },
          { label: 'In Progress', value: stats?.inProgress || 0, icon: Clock, className: 'bg-indigo-50 text-indigo-700' },
          { label: 'Responded', value: stats?.responded || 0, icon: MessageSquareReply, className: 'bg-green-50 text-green-700' },
          { label: 'Closed', value: stats?.closed || 0, icon: CheckCircle2, className: 'bg-gray-50 text-gray-700' },
          { label: 'Unread', value: stats?.unread || 0, icon: Eye, className: 'bg-purple-50 text-purple-700' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={`${stat.className} rounded-2xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-75">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className="opacity-70" size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, phone, company, subject, or message"
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value as 'all' | ContactStatus); setPage(1); }} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500">
            <option value="all">All Statuses</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500">
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold">Subject</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">Loading messages...</td></tr>
                ) : messages.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">No contact messages found</td></tr>
                ) : (
                  messages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{message.fullName}</div>
                        <div className="text-gray-500">{message.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 line-clamp-1">{message.subject}</div>
                        <div className="text-gray-500 line-clamp-1">{message.message}</div>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={message.status} isRead={message.isRead} /></td>
                      <td className="px-5 py-4 text-gray-500">{new Date(message.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => openDetails(message)}><Eye size={16} className="mr-2" />View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 p-4">
            <p className="text-sm text-gray-500">Showing {meta.total === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, meta.total)} of {meta.total}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Previous</Button>
              <Button size="sm" variant="ghost" disabled={page >= meta.totalPages} onClick={() => setPage((current) => Math.min(current + 1, meta.totalPages))}>Next</Button>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          {selectedUpdated ? (
            <Card className="p-6 sticky top-8">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                  <p className="text-sm text-gray-500">Submitted {new Date(selectedUpdated.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={selectedUpdated.status} isRead={selectedUpdated.isRead} />
              </div>

              <div className="space-y-4 text-sm">
                <InfoRow icon={Mail} label="Email" value={selectedUpdated.email} />
                {selectedUpdated.phone && <InfoRow icon={Phone} label="Phone" value={selectedUpdated.phone} />}
                {selectedUpdated.company && <InfoRow icon={Building2} label="Company" value={selectedUpdated.company} />}
                <InfoRow icon={Calendar} label="Subject" value={selectedUpdated.subject} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Message</p>
                  <p className="rounded-xl bg-gray-50 p-4 text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedUpdated.message}</p>
                </div>
                {selectedUpdated.response && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-green-700 font-semibold mb-2">Admin Reply</p>
                    <p className="rounded-xl bg-green-50 p-4 text-green-900 whitespace-pre-wrap leading-relaxed">{selectedUpdated.response}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3">
                <Button onClick={() => setReplyOpen(true)}><MessageSquareReply size={18} className="mr-2" />Reply / Mark Responded</Button>
              <select value={selectedUpdated.status} onChange={(e) => handleStatusChange(e.target.value as ContactStatus)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500">
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
                <Button variant="ghost" onClick={handleClose}><CheckCircle2 size={18} className="mr-2" />Close Inquiry</Button>
                <Button variant="danger" onClick={handleDelete}><Trash2 size={18} className="mr-2" />Delete Message</Button>
                <Link href={`/admin/contact-messages/${selectedUpdated.id}`} className="inline-flex justify-center rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  <ArrowUpDown size={18} className="mr-2" />Open Detail Page
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-gray-500 sticky top-8">Select a message to view details and manage the inquiry.</Card>
          )}
        </aside>
      </div>

      <Modal
        isOpen={replyOpen}
        onClose={() => setReplyOpen(false)}
        title="Reply to Inquiry"
        actions={
          <div className="flex gap-2">
            <Button type="submit" form="reply-form" loading={replyMutation.loading} className="flex-1">Save Reply</Button>
            <Button variant="ghost" onClick={() => setReplyOpen(false)} className="flex-1">Cancel</Button>
          </div>
        }
      >
        <form id="reply-form" onSubmit={handleReply} className="space-y-4">
          <Textarea label="Reply" value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={6} required />
        </form>
      </Modal>
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
  const label = status === 'IN_PROGRESS' ? 'In Progress' : status[0] + status.slice(1).toLowerCase().replace('_', ' ');
  return <Badge variant={variants[status]}>{isRead ? label : `${label} · Unread`}</Badge>;
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
