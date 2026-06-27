'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch } from '@/lib/hooks';
import { toursAPI } from '@/lib/api';
import { Tour, ToursResponse } from '@/types';
import { Card, Loader, EmptyState, Button, Badge, Input } from '@/components/common/UI';
import Link from 'next/link';
import { Search, Filter, ChevronDown, Calendar, MapPin, Users, DollarSign, Star } from 'lucide-react';

type PublicTourFilter = 'all' | 'featured' | 'upcoming' | 'ongoing' | 'completed';

function formatDate(date?: string) {
  if (!date) return 'Flexible dates';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPrice(price: number | string, currency = 'NGN') {
  const value = typeof price === 'string' ? Number.parseFloat(price) : price;
  if (!Number.isFinite(value)) return 'Price on request';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

function getTourCategory(tour: Tour, now = new Date()) {
  const start = tour.startDate ? new Date(tour.startDate) : null;
  const end = tour.endDate ? new Date(tour.endDate) : null;

  if (tour.status === 'CANCELLED') return 'cancelled';
  if (start && start > now) return 'upcoming';
  if (start && end && start <= now && end >= now) return 'ongoing';
  if (end && end < now) return 'completed';
  return 'published';
}

function TourCard({ tour, index }: { tour: Tour; index: number }) {
  const category = getTourCategory(tour);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/tours/${tour.slug}`}>
        <Card className="overflow-hidden group cursor-pointer h-full flex flex-col transition-all duration-300 hover:shadow-xl border-0">
          <div className="relative h-56 overflow-hidden bg-gray-100">
            {tour.featuredImage ? (
              <img
                src={tour.featuredImage}
                alt={tour.title}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-6xl">
                🌍
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {tour.featured && <Badge variant="warning">Featured</Badge>}
              <Badge variant={category === 'ongoing' ? 'success' : category === 'upcoming' ? 'info' : category === 'completed' ? 'default' : 'default'}>
                {category === 'ongoing' ? 'Ongoing' : category === 'upcoming' ? 'Upcoming' : category === 'completed' ? 'Completed' : 'Published'}
              </Badge>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{tour.destination}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{tour.title}</h3>
            {tour.departureLocation && (
              <p className="text-xs text-gray-400 mb-3">Departure: {tour.departureLocation}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(tour.startDate)} - {formatDate(tour.endDate)}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
              {tour.shortDescription || tour.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
              {tour.availableSlots !== undefined && (
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{tour.availableSlots} slots</span>
              )}
              {tour.duration && (
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{tour.duration} days</span>
              )}
            </div>
            <div className="flex justify-between items-center mt-auto">
              <div>
                <span className="text-blue-600 font-bold text-lg flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />{formatPrice(tour.price, tour.currency)}
                </span>
                {tour.discount && tour.discount > 0 && (
                  <span className="text-xs text-green-600 ml-2">-{tour.discount}%</span>
                )}
              </div>
              <Button size="sm" variant="primary">View Details</Button>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function ToursPage() {
  const { data: toursData, loading, error } = useFetch<ToursResponse>(() => toursAPI.getAll({ status: 'PUBLISHED' }));
  const tours = useMemo(() => toursData?.data || [], [toursData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDestination, setFilterDestination] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<PublicTourFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const destinations = useMemo(() => ['All', ...Array.from(new Set(tours.map((tour) => tour.destination).filter(Boolean))).sort()], [tours]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(tours.map((tour) => tour.category).filter(Boolean))).sort()], [tours]);
  const maxPrice = useMemo(() => tours.reduce((max, tour) => Math.max(max, Number(tour.price) || 0), 0), [tours]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const featuredTours = useMemo(() => tours.filter((tour) => tour.featured && tour.status === 'PUBLISHED'), [tours]);
  const upcomingTours = useMemo(() => tours.filter((tour) => getTourCategory(tour) === 'upcoming'), [tours]);
  const ongoingTours = useMemo(() => tours.filter((tour) => getTourCategory(tour) === 'ongoing'), [tours]);
  const completedTours = useMemo(() => tours.filter((tour) => getTourCategory(tour) === 'completed'), [tours]);

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const category = getTourCategory(tour);
      const matchesSearch = [tour.title, tour.destination, tour.description, tour.shortDescription, tour.category]
        .filter((value): value is string => typeof value === 'string')
        .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDestination = filterDestination === 'All' || tour.destination === filterDestination;
      const matchesCategory = filterCategory === 'All' || tour.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'featured' ? tour.featured : category === filterStatus);
      const upperPriceRange = maxPrice || priceRange[1];
      const matchesPrice = tour.price >= priceRange[0] && tour.price <= upperPriceRange;

      return matchesSearch && matchesDestination && matchesCategory && matchesStatus && matchesPrice;
    });
  }, [tours, searchQuery, filterDestination, filterCategory, filterStatus, priceRange, maxPrice]);

  const renderTourSection = (title: string, subtitle: string, sectionTours: Tour[], icon?: React.ReactNode) => {
    if (sectionTours.length === 0) return null;

    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-start justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-1">{subtitle}</p>
            </div>
            {icon}
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sectionTours.map((tour, index) => (
              <TourCard key={tour.id} tour={tour} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Discover Your Next Adventure</h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Explore our curated collection of premium tours and travel experiences across Africa and beyond.
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search destinations, tours, or experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg bg-white/95 text-gray-900 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {renderTourSection('Featured Tours', 'Handpicked experiences selected for exceptional value and demand.', featuredTours, <Star className="w-8 h-8 text-amber-500" />)}
      {renderTourSection('Upcoming Tours', 'Future departures you can plan and book ahead.', upcomingTours, <Calendar className="w-8 h-8 text-blue-500" />)}
      {renderTourSection('Ongoing Tours', 'Tours currently running based on their start and end dates.', ongoingTours, <Users className="w-8 h-8 text-emerald-500" />)}
      {renderTourSection('Completed Tours', 'Past adventures kept visible for reference and inspiration.', completedTours, <Badge variant="default">Completed</Badge>)}

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-gray-900">All Published Tours</h2>
              <p className="text-gray-600 mt-1">{filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'} found</p>
            </motion.div>

            <Button variant="ghost" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg shadow-md p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <select
                  value={filterDestination}
                  onChange={(e) => setFilterDestination(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {destinations.map((dest) => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as PublicTourFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Published</option>
                  <option value="featured">Featured</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>

                <Input
                  type="number"
                  label="Max price"
                  value={maxPrice || priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || maxPrice || 100000])}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {loading && <Loader />}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
              <p className="font-semibold">Error loading tours</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && filteredTours.length === 0 && (
            <EmptyState
              icon="🌍"
              title="No Tours Found"
              description="Try adjusting your search or filter criteria to find more tours."
            />
          )}

          {!loading && !error && filteredTours.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour, index) => (
                <TourCard key={tour.id} tour={tour} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
