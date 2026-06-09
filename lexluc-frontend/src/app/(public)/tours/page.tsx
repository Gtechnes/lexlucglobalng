'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch } from '@/lib/hooks';
import { toursAPI } from '@/lib/api';
import { Tour, TourStatus } from '@/types';
import { Card, Loader, EmptyState, Button, Badge, Input } from '@/components/common/UI';
import Link from 'next/link';
import { Search, Filter, ChevronDown, Calendar } from 'lucide-react';

const destinations = ['All', 'Lagos', 'Nairobi', 'Cape Town', 'Cairo', 'Accra', 'Johannesburg', 'Marrakech', 'Zanzibar', 'Victoria Falls', 'Serengeti'];
const categories = ['All', 'Adventure', 'Cultural', 'Luxury', 'Eco-Tourism', 'Business', 'Wellness', 'Wildlife', 'Historical', 'Beach', 'Mountain'];

export default function ToursPage() {
  const { data: toursData, loading, error } = useFetch(() => toursAPI.getAll());
  const response = toursData as any;
  const tours = response?.data ? response.data : [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDestination, setFilterDestination] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'all' | TourStatus>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredTours = useMemo(() => {
    return tours.filter((tour: Tour) => {
      const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tour.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (tour.shortDescription && tour.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDestination = filterDestination === 'All' || tour.destination === filterDestination;
      const matchesCategory = filterCategory === 'All' || tour.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || tour.status === filterStatus;
      const matchesPrice = tour.price >= priceRange[0] && tour.price <= priceRange[1];
      
      return matchesSearch && matchesDestination && matchesCategory && matchesStatus && matchesPrice;
    });
  }, [tours, searchQuery, filterDestination, filterCategory, filterStatus, priceRange]);

  const featuredTours = useMemo(() => {
    return tours.filter((tour: Tour) => tour.featured && tour.status === 'PUBLISHED');
  }, [tours]);

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Explore our curated collection of premium tours and travel experiences across Africa and beyond
            </p>
            
            {/* Search Bar */}
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

      {/* Featured Tours Section */}
      {featuredTours.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Tours</h2>
              <p className="text-gray-600">Handpicked experiences for your next journey</p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.slice(0, 3).map((tour: Tour, index: number) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/tours/${tour.slug}`}>
                    <Card className="overflow-hidden group cursor-pointer h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden">
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
                        <div className="absolute top-3 right-3">
                          <Badge variant="success" className="shadow-lg">Featured</Badge>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{tour.title}</h3>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                          📍 {tour.destination}
                        </p>
                        {tour.departureLocation && (
                          <p className="text-xs text-gray-400 mb-3">
                            ✈️ From {tour.departureLocation}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                          {tour.shortDescription || tour.description}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <div>
                            <span className="text-blue-600 font-bold text-lg">
                              ₦{Number(tour.price).toLocaleString()}
                            </span>
                            {tour.discount && tour.discount > 0 && (
                              <span className="text-xs text-green-600 ml-2">-{tour.discount}%</span>
                            )}
                          </div>
                          <Button size="sm" variant="primary">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Tours Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900">All Tours</h2>
              <p className="text-gray-600 mt-1">
                {filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'} found
              </p>
            </motion.div>
            
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filters Panel */}
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
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | TourStatus)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 100000])}
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
              {filteredTours.map((tour: Tour, index: number) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/tours/${tour.slug}`}>
                    <Card className="overflow-hidden group cursor-pointer h-full flex flex-col transition-all duration-300 hover:shadow-xl">
                      <div className="relative h-56 overflow-hidden">
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
                        {tour.featured && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="success" className="shadow-lg">Featured</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{tour.title}</h3>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                          📍 {tour.destination}
                        </p>
                        {tour.departureLocation && (
                          <p className="text-xs text-gray-400 mb-3">
                            ✈️ From {tour.departureLocation}
                          </p>
                        )}
                        
                        {/* Date Range */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <Calendar className="w-4 h-4" />
                          {tour.startDate && tour.endDate ? (
                            <span>{formatDate(tour.startDate)} - {formatDate(tour.endDate)}</span>
                          ) : (
                            <span>{tour.duration} days</span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                          {tour.shortDescription || tour.description}
                        </p>
                        
                        <div className="flex justify-between items-center mt-auto">
                          <div>
                            <span className="text-blue-600 font-bold text-lg">
                              ₦{Number(tour.price).toLocaleString()}
                            </span>
                            {tour.discount && tour.discount > 0 && (
                              <span className="text-xs text-green-600 ml-2">-{tour.discount}%</span>
                            )}
                            {tour.availableSlots !== undefined && tour.availableSlots > 0 && (
                              <p className="text-xs text-gray-500">
                                {tour.availableSlots} slots available
                              </p>
                            )}
                          </div>
                          <Button size="sm" variant="primary">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}