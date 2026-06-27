'use client';

import { Tour, TourHomeResponse } from '@/types';
import { useFetch } from '@/lib/hooks';
import { useCallback } from 'react';
import { toursAPI } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge, Card } from '@/components/common/UI';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPrice(price: number | string, currency: string = 'NGN'): string {
  const p = typeof price === 'string' ? parseFloat(price) : price;
  if (!Number.isFinite(p)) return 'Price on request';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(p);
}

function FeaturedTourCard({ tour }: { tour: Tour }) {
  const startDate = formatDate(tour.startDate || '');
  const endDate = formatDate(tour.endDate || '');
  const price = formatPrice(tour.price, tour.currency);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/tours/${tour.slug}`}>
        <Card className="group overflow-hidden cursor-pointer h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="relative h-56 overflow-hidden">
            <img
              src={tour.featuredImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/70 via-amber-900/10 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge variant="warning" className="bg-amber-500/90 text-white backdrop-blur-sm border-0">
                Featured
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {tour.category || 'Tour'}
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <div className="text-sm text-amber-600 font-semibold mb-1">{tour.destination}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{tour.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span>{startDate}</span>
              <span className="text-gray-300">→</span>
              <span>{endDate}</span>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
              {tour.shortDescription || tour.description}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-amber-700 font-bold">{price}</span>
              <span className="text-amber-700 font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
                View Details →
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function PastTourCard({ tour }: { tour: Tour }) {
  const startDate = formatDate(tour.startDate || '');
  const endDate = formatDate(tour.endDate || '');

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/tours/${tour.slug}`}>
        <Card className="group overflow-hidden cursor-pointer h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="relative h-52 overflow-hidden">
            <img
              src={tour.featuredImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="bg-gray-600/80 text-white backdrop-blur-sm border-0">
                Completed
              </Badge>
            </div>
            <div className="absolute bottom-3 right-3">
              <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {tour.category || 'Tour'}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 text-gray-900 px-6 py-2 rounded-full font-semibold text-sm">
                View Tour Gallery
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <div className="text-sm text-blue-600 font-semibold mb-1">{tour.destination}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{tour.title}</h3>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span>{startDate}</span>
              <span className="text-gray-300">→</span>
              <span>{endDate}</span>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
              {tour.shortDescription || tour.description}
            </p>

            <div className="mt-auto flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {tour.bookingsCount !== undefined && (
                  <span>👥 {tour.bookingsCount} travelers</span>
                )}
              </div>
              <span className="text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
                View Gallery →
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function CurrentTourCard({ tour }: { tour: Tour }) {
  const startDate = formatDate(tour.startDate || '');
  const endDate = formatDate(tour.endDate || '');

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/tours/${tour.slug}`}>
        <Card className="group overflow-hidden cursor-pointer h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="relative h-52 overflow-hidden">
            <img
              src={tour.featuredImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-emerald-900/10 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge variant="success" className="bg-emerald-500/80 text-white backdrop-blur-sm border-0 animate-pulse">
                Ongoing
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {tour.category || 'Tour'}
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <div className="text-sm text-emerald-600 font-semibold mb-1">{tour.destination}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{tour.title}</h3>

            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Start Date</span>
                <span className="font-medium text-gray-700">{startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">End Date</span>
                <span className="font-medium text-gray-700">{endDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available Slots</span>
                <span className="font-medium text-gray-700">{tour.availableSlots ?? 'Unlimited'}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
              {tour.shortDescription || tour.description}
            </p>

            <div className="mt-auto">
              <span className="inline-flex items-center text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform duration-300">
                Track Tour Details
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function UpcomingTourCard({ tour }: { tour: Tour }) {
  const startDate = formatDate(tour.startDate || '');
  const endDate = formatDate(tour.endDate || '');
  const price = formatPrice(tour.price, tour.currency);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/tours/${tour.slug}`}>
        <Card className="group overflow-hidden cursor-pointer h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="relative h-52 overflow-hidden">
            <img
              src={tour.featuredImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-900/10 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge variant="info" className="bg-blue-500/80 text-white backdrop-blur-sm border-0">
                Upcoming
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {tour.category || 'Tour'}
              </span>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <div className="text-sm text-blue-600 font-semibold mb-1">{tour.destination}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{tour.title}</h3>

            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date Range</span>
                <span className="font-medium text-gray-700">
                  {startDate} - {endDate}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available Slots</span>
                <span className="font-medium text-gray-700">{tour.availableSlots ?? 'TBA'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Starting Price</span>
                <span className="font-bold text-blue-600">{price}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
              {tour.shortDescription || tour.description}
            </p>

            <div className="mt-auto">
              <span className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm group-hover:bg-blue-700 transition-colors duration-300">
                Book Now
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function DynamicToursSection() {
  const fetchTours = useCallback(() => toursAPI.getHome(), []);
  const { data: tourHome } = useFetch<TourHomeResponse>(fetchTours, [fetchTours]);

  const featured = tourHome?.featured || [];
  const past = tourHome?.past || [];
  const current = tourHome?.current || [];
  const upcoming = tourHome?.upcoming || [];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-blue-600 font-semibold tracking-wider uppercase text-sm mb-3">
            Explore The World
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Past, Current & Upcoming Tours
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated tour experiences spanning past adventures, ongoing expeditions, and exciting future journeys.
          </p>
        </motion.div>

        {past.length === 0 && current.length === 0 && upcoming.length === 0 && featured.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No tours available at the moment</h3>
            <p className="text-gray-600">Check back soon for exciting new destinations and experiences.</p>
          </motion.div>
        )}

        <div className="space-y-16">
          {featured.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-6 w-1.5 bg-amber-500 rounded-full" />
                <h3 className="text-2xl font-bold text-gray-800">Featured Tours</h3>
                <span className="text-sm text-amber-600 ml-auto font-semibold">Handpicked journeys</span>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {featured.map((tour) => (
                  <FeaturedTourCard key={tour.id} tour={tour} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {past.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-6 w-1.5 bg-gray-400 rounded-full" />
                <h3 className="text-2xl font-bold text-gray-800">Past Tours & Destinations</h3>
                <span className="text-sm text-gray-500 ml-auto">Completed journeys</span>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {past.map((tour) => (
                  <PastTourCard key={tour.id} tour={tour} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {current.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-6 w-1.5 bg-emerald-500 rounded-full" />
                <h3 className="text-2xl font-bold text-gray-800">Current Tours & Destinations</h3>
                <span className="text-sm text-emerald-600 ml-auto font-semibold">● Live adventures</span>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {current.map((tour) => (
                  <CurrentTourCard key={tour.id} tour={tour} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {upcoming.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full" />
                <h3 className="text-2xl font-bold text-gray-800">Upcoming Tours & Destinations</h3>
                <span className="text-sm text-blue-600 ml-auto font-semibold">Future Adventures</span>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {upcoming.map((tour) => (
                  <UpcomingTourCard key={tour.id} tour={tour} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {past.length === 0 && current.length === 0 && upcoming.length === 0 && featured.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl"
            >
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No tours available at the moment</h3>
              <p className="text-gray-600">Check back soon for exciting new destinations.</p>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-16"
        >
          <Link
            href="/tours"
            className="inline-flex items-center bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            View All Tours
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
