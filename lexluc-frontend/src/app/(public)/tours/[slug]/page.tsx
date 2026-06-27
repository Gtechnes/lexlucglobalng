'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card, Loader, Badge, Button, Input } from '@/components/common/UI';
import { toursAPI, bookingsAPI } from '@/lib/api';
import { Tour, TourStatus, TourItineraryDay, CreateBookingRequest } from '@/types';
import { sanitizeHtml } from '@/lib/sanitize';
import { Calendar, Users, MapPin, Clock, ArrowLeft, Check, X } from 'lucide-react';
import { useMutation, useToast } from '@/lib/hooks';

export default function TourDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { success, error: showError } = useToast();

  const [bookingData, setBookingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numberOfTravelers: 1,
    specialRequests: '',
  });

  useEffect(() => {
    const fetchTour = async () => {
      try {
        console.log('[TourDetails] Fetching tour by slug', slug);
        setLoading(true);
        const data = await toursAPI.getBySlug(slug);
        console.log('[TourDetails] Tour response', data);
        if (!data || data.status !== 'PUBLISHED') {
          console.warn('[TourDetails] Tour is not published', data);
          notFound();
          return;
        }
        setTour(data);
        setError(null);
      } catch (err: unknown) {
        console.error('[TourDetails] Failed to load tour', err);
        const message = err instanceof Error ? err.message : '';
        if (message.includes('404') || message.includes('not found')) {
          notFound();
          return;
        }
        setError(message || 'Failed to load tour');
        setTour(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTour();
    }
  }, [slug]);

  const createBookingMutation = useMutation(
    (data: CreateBookingRequest) => bookingsAPI.create(data)
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tour) return;
    
    if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      console.log('[TourDetails] Submitting booking', { tourId: tour.id, travelers: bookingData.numberOfTravelers });
      await createBookingMutation.mutate({
        ...bookingData,
        tourId: tour.id,
      });
      console.log('[TourDetails] Booking submitted');
      success('Booking submitted successfully! We will contact you shortly.');
      setShowBookingForm(false);
      setBookingData({
        fullName: '',
        email: '',
        phone: '',
        numberOfTravelers: 1,
        specialRequests: '',
      });
    } catch (err: unknown) {
      console.error('[TourDetails] Failed to submit booking', err);
      showError(err instanceof Error ? err.message : 'Failed to submit booking');
    }
  };

  const getStatusVariant = (status: TourStatus) => {
    const variants: Record<TourStatus, 'success' | 'info' | 'error' | 'default'> = {
      'PUBLISHED': 'success',
      'UPCOMING': 'info',
      'COMPLETED': 'success',
      'CANCELLED': 'error',
      'DRAFT': 'default',
    };
    return variants[status] || 'default';
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isBookable = () => {
    if (!tour) return false;
    if (tour.status === 'CANCELLED' || tour.status === 'DRAFT') return false;
    if (tour.endDate) {
      const end = new Date(tour.endDate);
      if (!Number.isNaN(end.getTime()) && end < new Date()) return false;
    }
    return !(tour.availableSlots !== null && tour.availableSlots !== undefined && tour.availableSlots === 0);
  };

  const getBookingButtonText = () => {
    if (!tour) return 'Book Now';
    if (tour.status === 'CANCELLED') return 'Tour Cancelled';
    if (tour.endDate && new Date(tour.endDate) < new Date()) return 'Tour Completed';
    if (tour.availableSlots !== null && tour.availableSlots !== undefined && tour.availableSlots === 0) return 'Fully Booked';
    return 'Book Now';
  };

  const allImages = tour?.featuredImage 
    ? [tour.featuredImage, ...(tour.gallery || [])] 
    : tour?.gallery || [];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
            <p className="font-semibold">{error || 'Tour not found'}</p>
            <Link href="/tours" className="text-red-700 hover:text-red-800 underline mt-4 inline-block flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Tours
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const parsedItinerary = tour.itinerary
    ? (typeof tour.itinerary === 'string'
        ? (() => {
            try {
              return JSON.parse(tour.itinerary);
            } catch (error) {
              console.error('[TourDetails] Failed to parse itinerary JSON', error);
              return [];
            }
          })()
        : tour.itinerary)
    : [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {allImages.length > 0 ? (
          <img
            src={allImages[activeImage]}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-8xl">
            🌍
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <Link href="/tours" className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          All Tours
        </Link>

        {/* Tour Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {tour.title}
            </motion.h1>
            <div className="flex flex-wrap items-center gap-4 text-lg">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {tour.destination}
              </span>
              {tour.startDate && tour.endDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Thumbnails */}
      {allImages.length > 1 && (
        <section className="py-6 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tour Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour Overview</h2>
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(tour.description) }} />
              </motion.div>

              {/* Tour Itinerary */}
              {parsedItinerary.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Day-by-Day Itinerary
                  </h2>
                  <div className="space-y-4">
                    {parsedItinerary.map((day: TourItineraryDay, idx: number) => (
                      <Card key={idx} className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {day.day}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{day.title}</h3>
                            <p className="text-gray-600 mt-2">{day.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Inclusions */}
              {tour.inclusions && tour.inclusions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" />
                    What&apos;s Included
                  </h2>
                  <Card className="p-5">
                    <ul className="grid md:grid-cols-2 gap-2">
                      {tour.inclusions.map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}

              {/* Exclusions */}
              {tour.exclusions && tour.exclusions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <X className="w-6 h-6 text-red-600" />
                    What&apos;s Not Included
                  </h2>
                  <Card className="p-5">
                    <ul className="grid md:grid-cols-2 gap-2">
                      {tour.exclusions.map((exc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar - Booking */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <Badge variant={getStatusVariant(tour.status)} className="mb-2">
                      {tour.status}
                    </Badge>
                    <h3 className="text-2xl font-bold text-gray-900">
                      ₦{Number(tour.price).toLocaleString()}
                    </h3>
                    {tour.discount && tour.discount > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Early bird discount: {tour.discount}% off
                      </p>
                    )}
                  </div>

                  {tour.availableSlots !== null && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{tour.availableSlots} spots available</span>
                    </div>
                  )}

                  <Button
                    className="w-full mb-4"
                    onClick={() => setShowBookingForm(true)}
                    disabled={!isBookable()}
                  >
                    {getBookingButtonText()}
                  </Button>

                  <div className="border-t pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{tour.duration || 'N/A'} days</span>
                    </div>
                    {tour.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="font-semibold">{tour.category}</span>
                      </div>
                    )}
                    {tour.departureLocation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Departure</span>
                        <span className="font-semibold">{tour.departureLocation}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Book This Tour</h2>
                <p className="text-sm text-gray-600">{tour.title}</p>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                <Input
                  label="Full Name"
                  value={bookingData.fullName}
                  onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  required
                />
                <Input
                  label="Number of Travelers"
                  type="number"
                  min="1"
                  max={tour.availableSlots ?? undefined}
                  value={bookingData.numberOfTravelers}
                  onChange={(e) => setBookingData({ ...bookingData, numberOfTravelers: parseInt(e.target.value) })}
                  required
                />
                <Input
                  label="Special Requests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  placeholder="Any special requirements..."
                />
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={createBookingMutation.loading}
                  >
                    Confirm Booking
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}