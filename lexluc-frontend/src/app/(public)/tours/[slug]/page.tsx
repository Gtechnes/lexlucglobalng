'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Loader, Badge, Button, Input } from '@/components/common/UI';
import ImmersiveGallery from '@/components/common/ImmersiveGallery';
import { toursAPI, bookingsAPI } from '@/lib/api';
import { Tour, TourStatus, TourItineraryDay, CreateBookingRequest } from '@/types';
import { sanitizeHtml } from '@/lib/sanitize';
import { Calendar, Users, MapPin, Clock, ArrowLeft, Check, X, Star, Share2, Heart } from 'lucide-react';
import { useMutation, useToast } from '@/lib/hooks';

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setLoading(true);
        const data = await toursAPI.getBySlug(slug);
        if (!data || data.status !== 'PUBLISHED') {
          notFound();
          return;
        }
        setTour(data);
        setError(null);
      } catch (err: unknown) {
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
      await createBookingMutation.mutate({
        ...bookingData,
        tourId: tour.id,
      });
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

  const allImages = useMemo(() => {
    if (!tour) return [];
    return tour.featuredImage 
      ? [tour.featuredImage, ...(tour.gallery || [])] 
      : tour.gallery || [];
  }, [tour]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-96 bg-gradient-to-r from-blue-200 to-purple-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen py-16 bg-gray-50">
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
            } catch {
              return [];
            }
          })()
        : tour.itinerary)
    : [];

  const DiscountedPrice = () => {
    if (!tour.discount || tour.discount <= 0) return null;
    const discounted = tour.price * (1 - tour.discount / 100);
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">₦{discounted.toLocaleString()}</span>
        <span className="text-lg text-gray-400 line-through">₦{tour.price.toLocaleString()}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex items-center justify-center"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[60vh] md:h-[70vh] overflow-hidden"
      >
        {allImages.length > 0 ? (
          <>
            <Image
              src={allImages[0]}
              alt={tour.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 mix-blend-overlay" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
            <span className="text-9xl">🌍</span>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-gray-800 hover:bg-white transition-colors duration-200 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors duration-200 shadow-lg"
                aria-label="Add to favorites"
              >
                <Heart className="w-5 h-5 text-gray-700" />
              </button>
              <button
                className="inline-flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors duration-200 shadow-lg"
                aria-label="Share tour"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant={getStatusVariant(tour.status)} className="bg-white/20 backdrop-blur-sm text-white border-0">
                  {tour.status}
                </Badge>
                {tour.category && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {tour.category}
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {tour.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-lg md:text-xl">
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
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ImmersiveGallery images={allImages} tourTitle={tour.title} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-blue-600" />
                    </span>
                    Tour Overview
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(tour.description) }} />
                  </div>
                </div>

                {tour.highlights && tour.highlights.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Tour Highlights</h3>
                    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <ul className="grid md:grid-cols-2 gap-3">
                        {tour.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0 fill-blue-600" />
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}

                {parsedItinerary.length > 0 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </span>
                      Day-by-Day Itinerary
                    </h2>
                    <div className="space-y-4">
                      {parsedItinerary.map((day: TourItineraryDay, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                        >
                          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                                {day.day}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{day.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{day.description}</p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {tour.inclusions && tour.inclusions.length > 0 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </span>
                      What&apos;s Included
                    </h2>
                    <Card className="p-6 bg-white">
                      <ul className="grid md:grid-cols-2 gap-3">
                        {tour.inclusions.map((inc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}

                {tour.exclusions && tour.exclusions.length > 0 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <X className="w-5 h-5 text-red-600" />
                      </span>
                      What&apos;s Not Included
                    </h2>
                    <Card className="p-6 bg-white">
                      <ul className="grid md:grid-cols-2 gap-3">
                        {tour.exclusions.map((exc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <X className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="p-6 bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="text-center mb-6 pb-6 border-b border-gray-100">
                      <div className="mb-2">
                        {tour.discount && tour.discount > 0 ? <DiscountedPrice /> : (
                          <span className="text-3xl font-bold text-gray-900">₦{Number(tour.price).toLocaleString()}</span>
                        )}
                      </div>
                      {tour.discount && tour.discount > 0 && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          Early bird discount: {tour.discount}% off
                        </p>
                      )}
                      
                      <Badge variant={getStatusVariant(tour.status)} className="mt-3 bg-blue-50 text-blue-700">
                        {tour.status}
                      </Badge>
                    </div>

                    {tour.availableSlots !== null && (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                        <Users className="w-4 h-4" />
                        <span>{tour.availableSlots} spots available</span>
                      </div>
                    )}

                    <Button
                      className="w-full mb-6 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                      onClick={() => setShowBookingForm(true)}
                      disabled={!isBookable()}
                    >
                      {getBookingButtonText()}
                    </Button>

                    <div className="space-y-3 text-sm">
                      {tour.duration && (
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-semibold text-gray-900">{tour.duration} days</span>
                        </div>
                      )}
                      {tour.category && (
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-600">Category</span>
                          <span className="font-semibold text-gray-900">{tour.category}</span>
                        </div>
                      )}
                      {tour.departureLocation && (
                        <div className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-gray-600">Departure</span>
                          <span className="font-semibold text-gray-900">{tour.departureLocation}</span>
                        </div>
                      )}
                      {tour.maxParticipants && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Max Participants</span>
                          <span className="font-semibold text-gray-900">{tour.maxParticipants}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Secure your spot on this unforgettable journey today
            </p>
            <Button
              className="bg-white text-blue-600 hover:bg-gray-50 py-4 px-8 text-lg font-semibold rounded-xl shadow-lg"
              onClick={() => setShowBookingForm(true)}
              disabled={!isBookable()}
            >
              Book This Tour Now
            </Button>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {showBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
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
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 py-3 rounded-xl"
                    loading={createBookingMutation.loading}
                  >
                    Confirm Booking
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 py-3 rounded-xl"
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