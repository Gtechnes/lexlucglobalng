'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFetch, useToast } from '@/lib/hooks';
import { bookingsAPI } from '@/lib/api';
import { toursAPI } from '@/lib/api';
import { Booking, BookingStatus, PaymentStatus, Tour } from '@/types';
import { Table, Badge, Button, Card } from '@/components/common/UI';
import { Search } from 'lucide-react';

export default function AdminBookingsPage() {
  const { data: bookingsData, loading, refetch } = useFetch(() => bookingsAPI.getAll());
  const { data: toursData } = useFetch(() => toursAPI.getAll());
  const bookingsResponse = bookingsData as any;
  const toursResponse = toursData as any;
  const bookings = bookingsResponse?.data ? bookingsResponse.data : [];
  const tours = toursResponse?.data ? toursResponse.data : [];
  const { success, error: showError } = useToast();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus | ''>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus | ''>('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');
  const [filterTour, setFilterTour] = useState<'all' | string>('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking: Booking) => {
      const matchesSearch = 
        booking.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.tour?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const matchesTour = filterTour === 'all' || booking.tourId === filterTour;
      return matchesSearch && matchesStatus && matchesTour;
    });
  }, [bookings, searchQuery, filterStatus, filterTour]);

  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;
    
    try {
      setStatusUpdating(true);
      await bookingsAPI.updateStatus(selectedBooking.id, newStatus);
      success('Booking status updated');
      setSelectedBooking(null);
      setNewStatus('');
      setNewPaymentStatus('');
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      await bookingsAPI.delete(id);
      success('Booking deleted successfully');
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to delete booking');
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, any> = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'error',
      'COMPLETED': 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    if (!status) return null;
    const colors: Record<PaymentStatus, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800',
      'REFUNDED': 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{bookings.filter((b: Booking) => b.status === 'PENDING').length}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{bookings.filter((b: Booking) => b.status === 'CONFIRMED').length}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{bookings.filter((b: Booking) => b.status === 'CANCELLED').length}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
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
          value={filterTour}
          onChange={(e) => setFilterTour(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tours</option>
          {tours.map((t: Tour) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          loading={loading}
          empty={!loading && filteredBookings.length === 0}
          columns={[
            { 
              key: 'fullName', 
              label: 'Guest',
              render: (v, row) => (
                <div>
                  <div className="font-medium">{row.fullName}</div>
                  <div className="text-xs text-gray-500">{row.email}</div>
                </div>
              )
            },
            { 
              key: 'tour', 
              label: 'Tour',
              render: (v, row) => row.tour?.title || 'N/A'
            },
            { 
              key: 'numberOfTravelers', 
              label: 'Travelers',
              render: (v) => `${v} person${v !== 1 ? 's' : ''}`
            },
            { 
              key: 'totalPrice', 
              label: 'Total',
              render: (v) => `₦${Number(v).toLocaleString()}`
            },
            { 
              key: 'status', 
              label: 'Status',
              render: (v) => getStatusBadge(v)
            },
            { 
              key: 'paymentStatus', 
              label: 'Payment',
              render: (v) => getPaymentStatusBadge(v)
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (_, row) => (
                <div className="space-x-2">
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

      {/* Update Status Sidebar */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
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
                <p className="text-sm font-medium text-gray-700 mb-1">Total</p>
                <p className="text-gray-900 font-semibold">₦{Number(selectedBooking.totalPrice).toLocaleString()}</p>
              </div>
              
              <hr />
              
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