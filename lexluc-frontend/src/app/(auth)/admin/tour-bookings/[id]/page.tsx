'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookingsAPI } from '@/lib/api';
import { Booking, BookingStatus, PaymentStatus } from '@/types';
import { Badge, Button, Card, Loader, EmptyState } from '@/components/common/UI';
import { useToast } from '@/lib/hooks';
import { Calendar, Users, MapPin, Phone, Mail, Building, Globe, FileText, MessageSquare, ArrowLeft } from 'lucide-react';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await bookingsAPI.getOne(id);
        setBooking(data);
        setNewNotes(data.notes || '');
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '';
        if (message.includes('404') || message.includes('not found')) {
          setError('Booking not found');
          return;
        }
        setError(message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!booking) return;
    
    try {
      setUpdatingStatus(true);
      await bookingsAPI.updateStatus(booking.id, status);
      success(`Booking ${status.toLowerCase()} successfully`);
      setBooking({ ...booking, status });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusUpdate = async (paymentStatus: PaymentStatus) => {
    if (!booking) return;
    
    try {
      setUpdatingPayment(true);
      await bookingsAPI.updatePaymentStatus(booking.id, paymentStatus);
      success(`Payment status updated to ${paymentStatus.toLowerCase()}`);
      setBooking({ ...booking, paymentStatus });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!booking) return;
    
    try {
      setUpdatingStatus(true);
      await bookingsAPI.updateNotes(booking.id, newNotes);
      success('Notes updated successfully');
      setBooking({ ...booking, notes: newNotes });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Failed to update notes');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!booking || !confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    
    try {
      await bookingsAPI.delete(booking.id);
      success('Booking deleted successfully');
      router.push('/admin/tour-bookings');
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Failed to delete booking');
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
      'PAID': 'success',
      'PENDING': 'warning',
      'REFUNDED': 'error',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState 
          icon="📋"
          title="Booking not found" 
          description={error || 'The requested booking could not be found'} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Customer Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900 font-semibold">{booking.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <p className="text-gray-900">{booking.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </label>
                <p className="text-gray-900">{booking.phone}</p>
              </div>
              {booking.company && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Company
                  </label>
                  <p className="text-gray-900">{booking.company}</p>
                </div>
              )}
              {booking.country && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Country
                  </label>
                  <p className="text-gray-900">{booking.country}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Tour Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tour Title</label>
                <p className="text-gray-900 font-semibold">{booking.tour?.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Destination</label>
                <p className="text-gray-900">{booking.tour?.destination}</p>
              </div>
              {booking.tour?.category && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900">{booking.tour.category}</p>
                </div>
              )}
              {booking.tour?.departureLocation && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Departure Location</label>
                  <p className="text-gray-900">{booking.tour.departureLocation}</p>
                </div>
              )}
              {booking.tour?.startDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-gray-900">{new Date(booking.tour.startDate).toLocaleDateString()}</p>
                </div>
              )}
              {booking.tour?.endDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-gray-900">{new Date(booking.tour.endDate).toLocaleDateString()}</p>
                </div>
              )}
              {booking.tour?.status && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tour Status</label>
                  <p className="text-gray-900">{booking.tour.status}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Booking Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Booking Reference</label>
                <p className="text-gray-900 font-mono font-semibold">#{booking.referenceNo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Booking Date</label>
                <p className="text-gray-900">{new Date(booking.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Travelers
                </label>
                <p className="text-gray-900">{booking.numberOfTravelers} person{booking.numberOfTravelers !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Price</label>
                <p className="text-gray-900">₦{Number(booking.totalPrice || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Booking Status</label>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <div className="mt-1">{getPaymentStatusBadge(booking.paymentStatus)}</div>
              </div>
              {booking.specialRequests && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Special Requests</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              Internal Notes
            </h2>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleNotesUpdate} loading={updatingStatus}>
                Save Notes
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map(status => (
                    <Button
                      key={status}
                      variant={booking.status === status ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updatingStatus || booking.status === status}
                      className="w-full"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Update Payment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PENDING', 'PAID', 'REFUNDED'] as PaymentStatus[]).map(status => (
                    <Button
                      key={status}
                      variant={booking.paymentStatus === status ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handlePaymentStatusUpdate(status)}
                      disabled={updatingPayment || booking.paymentStatus === status}
                      className="w-full"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <hr className="my-4" />

              <Button variant="danger" onClick={handleDelete} className="w-full">
                Delete Booking
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}