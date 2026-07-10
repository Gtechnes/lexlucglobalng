'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFetch, useToast } from '@/lib/hooks';
import { bookingsAPI, toursAPI } from '@/lib/api';
import { Booking, BookingStatus, PaymentStatus, BookingStats } from '@/types';
import { Table, Badge, Button, Card, Loader, EmptyState } from '@/components/common/UI';
import { Search, Calendar, Users, MapPin, Filter, SortAsc, SortDesc } from 'lucide-react';
import Link from 'next/link';

export default function AdminTourBookingsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | PaymentStatus>('all');
  const [filterDestination, setFilterDestination] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'customerName' | 'tourName' | 'bookingStatus'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus | ''>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus | ''>('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [destinations, setDestinations] = useState<string[]>([]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterStatus, filterPayment, filterDestination]);

  const { data: bookingsData, loading, refetch } = useFetch(
    () => bookingsAPI.getAll({
      page: String(page),
      limit: '20',
      status: filterStatus !== 'all' ? filterStatus : undefined,
      paymentStatus: filterPayment !== 'all' ? filterPayment : undefined,
      search: searchQuery || undefined,
      sortBy: sortBy,
      sortDir: sortDir,
    }),
    [page, filterStatus, filterPayment, searchQuery, sortBy, sortDir],
  );

  const { data: toursData } = useFetch(() => toursAPI.getDestinations());

  useEffect(() => {
    if (toursData && Array.isArray(toursData)) {
      setDestinations(toursData as string[]);
    }
  }, [toursData]);

  const { data: statsData } = useFetch(() => bookingsAPI.getStats());

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  const bookingsResponse = bookingsData as any;
  const bookings = bookingsResponse?.data ? bookingsResponse.data : [];
  const meta = bookingsResponse?.meta;
  const { success, error: showError } = useToast();

  const filteredBookings = useMemo(() => bookings, [bookings]);

  const handleStatusChange = async () => {
    if (!selectedBooking) return;

    const updates: Promise<any>[] = [];
    if (newStatus && newStatus !== selectedBooking.status) {
      updates.push(bookingsAPI.updateStatus(selectedBooking.id, newStatus));
    }
    if (newPaymentStatus && newPaymentStatus !== selectedBooking.paymentStatus) {
      updates.push(bookingsAPI.updatePaymentStatus(selectedBooking.id, newPaymentStatus));
    }
    if (updates.length === 0) {
      showError('No changes detected');
      return;
    }

    try {
      setStatusUpdating(true);
      await Promise.all(updates);
      success('Booking updated successfully');
      setSelectedBooking(null);
      setNewStatus('');
      setNewPaymentStatus('');
      refetch();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message || 'Failed to update booking' : 'Failed to update booking');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

    try {
      await bookingsAPI.delete(id);
      success('Booking deleted successfully');
      refetch();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message || 'Failed to delete booking' : 'Failed to delete booking');
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, 'success' | 'warning' | 'error' | 'default'> = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'error',
      'COMPLETED': 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    if (!status) return <Badge variant="warning">PENDING</Badge>;
    const variants: Record<PaymentStatus, 'success' | 'warning' | 'error' | 'default'> = {
      'PENDING': 'warning',
      'PAID': 'success',
      'REFUNDED': 'error',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tour Bookings Management</h1>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings by ID, name, email, phone, tour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | BookingStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as 'all' | PaymentStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Payments</option>
          <option value="PENDING">Pending Payment</option>
          <option value="PAID">Paid</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select
          value={filterDestination}
          onChange={(e) => setFilterDestination(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Destinations</option>
          {destinations.map(dest => (
            <option key={dest} value={dest}>{dest}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'customerName' | 'tourName' | 'bookingStatus')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">Sort by Date</option>
          <option value="customerName">Sort by Customer</option>
          <option value="tourName">Sort by Tour</option>
          <option value="bookingStatus">Sort by Status</option>
        </select>
        <button
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          title={sortDir === 'asc' ? 'Oldest First' : 'Newest First'}
        >
          {sortDir === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="From"
                />
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No bookings found"
          description="No bookings match your search criteria. Try adjusting your filters."
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table
            loading={loading}
            columns={[
              {
                key: 'referenceNo',
                label: 'Reference',
                render: (v, row) => (
                  <Link href={`/admin/tour-bookings/${row.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                    {row.referenceNo}
                  </Link>
                ),
              },
              {
                key: 'fullName',
                label: 'Customer',
                render: (v, row) => (
                  <div>
                    <div className="font-medium text-gray-900">{row.fullName}</div>
                    <div className="text-xs text-gray-500">{row.email}</div>
                    {row.phone && <div className="text-xs text-gray-500">{row.phone}</div>}
                  </div>
                ),
              },
              {
                key: 'tour',
                label: 'Tour',
                render: (v, row) => (
                  <div>
                    <div className="font-medium text-gray-900">{row.tour?.title || 'N/A'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {row.tour?.destination || 'Unknown'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'numberOfTravelers',
                label: 'Travelers',
                render: (v) => (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {v} person{v !== 1 ? 's' : ''}
                  </span>
                ),
              },
              {
                key: 'totalPrice',
                label: 'Total',
                render: (v) => `₦${Number(v || 0).toLocaleString()}`,
              },
              {
                key: 'status',
                label: 'Status',
                render: (v) => getStatusBadge(v),
              },
              {
                key: 'paymentStatus',
                label: 'Payment',
                render: (v) => getPaymentStatusBadge(v),
              },
              {
                key: 'createdAt',
                label: 'Booked On',
                render: (v) => new Date(v).toLocaleDateString(),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (_, row) => (
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/tour-bookings/${row.id}`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1">
                      View
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedBooking(row);
                        setNewStatus(row.status);
                        setNewPaymentStatus(row.paymentStatus || 'PENDING');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredBookings}
          />
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            Showing page {meta.page} of {meta.totalPages} · {meta.total} bookings total
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
              disabled={page >= meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-md w-full mx-4"
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Update Booking</h3>
              <p className="text-sm text-gray-600">#{selectedBooking.referenceNo}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Guest</p>
                <p className="text-gray-900">{selectedBooking.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Tour</p>
                <p className="text-gray-900">{selectedBooking.tour?.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Created</p>
                <p className="text-gray-900">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
              </div>

              <hr className="my-4" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as BookingStatus | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Payment Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleStatusChange}
                  loading={statusUpdating}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}