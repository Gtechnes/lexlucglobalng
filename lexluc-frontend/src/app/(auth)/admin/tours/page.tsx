'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFetch, useMutation, useToast } from '@/lib/hooks';
import { toursAPI } from '@/lib/api';
import { Tour, TourStatus, TourItineraryDay } from '@/types';
import { Button, Input, Select, Badge } from '@/components/common/UI';
import { ImageUpload } from '@/components/common/ImageUpload';
import { Modal } from '@/components/common/UI';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Search, Plus, Edit, Trash2, Star, Globe, Calendar, DollarSign, MapPin, Check, X } from 'lucide-react';

const tourCategories = ['Adventure', 'Cultural', 'Luxury', 'Eco-Tourism', 'Business', 'Wellness', 'Wildlife', 'Historical', 'Beach', 'Mountain'];
const currencies = ['NGN', 'USD', 'EUR', 'GBP', 'CAD'];
const destinations = ['Lagos', 'Nairobi', 'Cape Town', 'Cairo', 'Accra', 'Johannesburg', 'Marrakech', 'Zanzibar', 'Victoria Falls', 'Serengeti'];

export default function AdminToursPage() {
  const { data: toursData, loading, refetch } = useFetch(() => toursAPI.getAll());
  const response = toursData as any;
  const tours = response?.data ? response.data : [];
  const { success, error: showError } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | TourStatus>('all');
  const [filterDestination, setFilterDestination] = useState<'all' | string>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'true' | 'false'>('all');

  interface FormData {
    title: string;
    slug: string;
    category: string;
    destination: string;
    departureLocation: string;
    shortDescription: string;
    description: string;
    startDate: string;
    endDate: string;
    status: TourStatus;
    price: number;
    currency: string;
    availableSlots: number | null;
    discount: number;
    featuredImage: string;
    gallery: string[];
    inclusions: string[];
    exclusions: string[];
    featured: boolean;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    content: string;
    duration: number;
  }

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    category: '',
    destination: '',
    departureLocation: '',
    shortDescription: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    price: 0,
    currency: 'NGN',
    availableSlots: null,
    discount: 0,
    featuredImage: '',
    gallery: [],
    inclusions: [''],
    exclusions: [''],
    featured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    content: '',
    duration: 1,
  });

  const [itineraryDays, setItineraryDays] = useState<TourItineraryDay[]>([
    { day: 1, title: '', description: '' },
  ]);

  const createMutation = useMutation<Tour, Partial<FormData>>((data) => toursAPI.create(data as any));
  const updateMutation = useMutation<Tour, Partial<FormData>>((data) => toursAPI.update(editingId!, data as any));

  const filteredTours = useMemo(() => {
    return tours.filter((tour: Tour) => {
      const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tour.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tour.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || tour.status === filterStatus;
      const matchesDestination = filterDestination === 'all' || tour.destination === filterDestination;
      const matchesFeatured = filterFeatured === 'all' || 
                               (filterFeatured === 'true' && tour.featured) ||
                               (filterFeatured === 'false' && !tour.featured);
      return matchesSearch && matchesStatus && matchesDestination && matchesFeatured;
    });
  }, [tours, searchQuery, filterStatus, filterDestination, filterFeatured]);

  const stats = {
    total: tours.length,
    published: tours.filter((t: Tour) => t.status === 'PUBLISHED').length,
    draft: tours.filter((t: Tour) => t.status === 'DRAFT').length,
    featured: tours.filter((t: Tour) => t.featured).length,
    upcoming: tours.filter((t: Tour) => t.status === 'UPCOMING').length,
    completed: tours.filter((t: Tour) => t.status === 'COMPLETED').length,
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      category: '',
      destination: '',
      departureLocation: '',
      shortDescription: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'DRAFT',
      price: 0,
      currency: 'NGN',
      availableSlots: null,
      discount: 0,
      featuredImage: '',
      gallery: [],
      inclusions: [''],
      exclusions: [''],
      featured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      content: '',
      duration: 1,
    });
    setItineraryDays([{ day: 1, title: '', description: '' }]);
    setShowModal(true);
  };

  const handleEdit = (tour: Tour) => {
    setEditingId(tour.id);
    const parsedItinerary = tour.itinerary 
      ? (typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : tour.itinerary)
      : [{ day: 1, title: '', description: '' }];
    
    setFormData({
      title: tour.title,
      slug: tour.slug,
      category: tour.category || '',
      destination: tour.destination,
      departureLocation: tour.departureLocation || '',
      shortDescription: tour.shortDescription || '',
      description: tour.description,
      startDate: tour.startDate ? tour.startDate.split('T')[0] : '',
      endDate: tour.endDate ? tour.endDate.split('T')[0] : '',
      status: tour.status,
      price: tour.price,
      currency: tour.currency || 'NGN',
      availableSlots: tour.availableSlots || tour.maxParticipants || null,
      discount: tour.discount || 0,
      featuredImage: tour.featuredImage || tour.image || '',
      gallery: tour.gallery || [],
      inclusions: tour.inclusions?.length ? tour.inclusions : [''],
      exclusions: tour.exclusions?.length ? tour.exclusions : [''],
      featured: tour.featured,
      seoTitle: tour.seoTitle || tour.metaTitle || '',
      seoDescription: tour.seoDescription || tour.metaDescription || '',
      seoKeywords: tour.seoKeywords || '',
      content: tour.content || '',
      duration: tour.duration || 1,
    });
    setItineraryDays(parsedItinerary);
    setShowModal(true);
  };

  // Itinerary handlers
  const addItineraryDay = () => {
    const newDay = itineraryDays.length + 1;
    setItineraryDays([...itineraryDays, { day: newDay, title: '', description: '' }]);
  };

  const removeItineraryDay = (idx: number) => {
    setItineraryDays(itineraryDays.filter((_, i) => i !== idx));
  };

  const updateItineraryDay = (idx: number, field: 'title' | 'description', value: string) => {
    setItineraryDays(itineraryDays.map((day, i) => i === idx ? { ...day, [field]: value } : day));
  };

  // Inclusion/Exclusion handlers
  const addInclusion = () => setFormData({ ...formData, inclusions: [...formData.inclusions, ''] });
  const removeInclusion = (idx: number) => setFormData({ ...formData, inclusions: formData.inclusions.filter((_, i) => i !== idx) });
  const updateInclusion = (idx: number, value: string) => setFormData({
    ...formData,
    inclusions: formData.inclusions.map((inc, i) => i === idx ? value : inc),
  });

  const addExclusion = () => setFormData({ ...formData, exclusions: [...formData.exclusions, ''] });
  const removeExclusion = (idx: number) => setFormData({ ...formData, exclusions: formData.exclusions.filter((_, i) => i !== idx) });
  const updateExclusion = (idx: number, value: string) => setFormData({
    ...formData,
    exclusions: formData.exclusions.map((exc, i) => i === idx ? value : exc),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showError('Tour title is required');
      return;
    }

    if (!formData.destination.trim()) {
      showError('Destination is required');
      return;
    }

    if (formData.duration < 1) {
      showError('Duration must be at least 1 day');
      return;
    }

    const submitData = {
      ...formData,
      inclusions: formData.inclusions.filter(i => i.trim()),
      exclusions: formData.exclusions.filter(e => e.trim()),
      gallery: formData.gallery,
      itinerary: itineraryDays.filter(d => d.title || d.description),
    };

    try {
      if (editingId) {
        await updateMutation.mutate(submitData);
        success('Tour updated successfully');
      } else {
        await createMutation.mutate(submitData);
        success('Tour created successfully');
      }
      setShowModal(false);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to save tour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
      await toursAPI.delete(id);
      success('Tour deleted successfully');
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to delete tour');
    }
  };

  const handleToggleFeatured = async (tour: Tour) => {
    try {
      await toursAPI.toggleFeatured(tour.id);
      success(`${tour.featured ? 'Unfeatured' : 'Featured'} tour successfully`);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to update tour');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const url = await uploadToCloudinary(file, 'tour');
        uploadedUrls.push(url);
      } catch (error) {
        showError(`Failed to upload ${file.name}`);
      }
    }

    if (uploadedUrls.length) {
      setFormData({ ...formData, gallery: [...formData.gallery, ...uploadedUrls] });
    }
  };

  const removeGalleryImage = (idx: number) => {
    setFormData({ ...formData, gallery: formData.gallery.filter((_, i) => i !== idx) });
  };

  const getStatusBadge = (status: TourStatus) => {
    const variants: Record<TourStatus, any> = {
      'PUBLISHED': 'success',
      'DRAFT': 'default',
      'UPCOMING': 'info',
      'COMPLETED': 'success',
      'CANCELLED': 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tours Management</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tour
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tours</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-sm text-gray-600">Published</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          <div className="text-sm text-gray-600">Draft</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
          <div className="text-sm text-gray-600">Featured</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | TourStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Destinations</option>
            {destinations.map((dest) => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as 'all' | 'true' | 'false')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tours</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tour</th>
              <th className="px-4 py-3 text-left font-semibold">Destination</th>
              <th className="px-4 py-3 text-left font-semibold">Dates</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
                  </div>
                </td>
              </tr>
            ) : filteredTours.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No tours found
                </td>
              </tr>
            ) : (
              filteredTours.map((tour: Tour, index: number) => (
                <motion.tr
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {tour.featuredImage ? (
                        <img src={tour.featuredImage} alt={tour.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded flex items-center justify-center text-xl">🌍</div>
                      )}
                      <div>
                        <div className="font-medium">{tour.title}</div>
                        {tour.category && <div className="text-xs text-gray-500">{tour.category}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">📍 {tour.destination}</span>
                  </td>
                  <td className="px-4 py-3">
                    {tour.startDate && tour.endDate ? (
                      <span className="text-sm">
                        {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No dates set</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">₦{Number(tour.price).toLocaleString()}</span>
                    {tour.discount && tour.discount > 0 && (
                      <span className="text-xs text-green-600 ml-2">{tour.discount}% off</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(tour.status)}
                    {tour.featured && <Star className="w-4 h-4 text-yellow-500 inline-block ml-2" fill="currentColor" />}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleFeatured(tour)}
                      className={tour.featured ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}
                      title={tour.featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(tour)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tour.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Tour' : 'Add Tour'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Tour Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                required
              />
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                help="URL-friendly name"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={tourCategories.map(c => ({ value: c, label: c }))}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TourStatus })}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PUBLISHED', label: 'Published' },
                  { value: 'UPCOMING', label: 'Upcoming' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                options={destinations.map(d => ({ value: d, label: d }))}
              />
              <Input
                label="Departure Location"
                value={formData.departureLocation}
                onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                placeholder="e.g., Murtala Muhammed Airport"
              />
            </div>
            <Input
              label="Short Description"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              help="Max 200 characters - used on cards and search results"
            />
          </div>

          {/* Tour Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tour Dates
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Information
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
              <Select
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={currencies.map(c => ({ value: c, label: c }))}
              />
              <Input
                label="Available Slots"
                type="number"
                min="0"
                value={formData.availableSlots ?? ''}
                onChange={(e) => setFormData({ ...formData, availableSlots: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Unlimited"
              />
            </div>
            <Input
              label="Early Bird Discount (%)"
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
              placeholder="0"
            />
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Descriptions</h3>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Featured Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Featured Image</h3>
            <ImageUpload
              label="Tour Image (Hero Banner/Thumbnail/SEO)"
              type="tour"
              preview={formData.featuredImage}
              onUpload={(url) => setFormData({ ...formData, featuredImage: url })}
            />
          </div>

          {/* Gallery */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Gallery</h3>
            <div>
              {formData.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {formData.gallery.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 inline-block">
                Upload Gallery Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Itinerary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tour Itinerary (Day-by-Day)
            </h3>
            <div className="space-y-3">
              {itineraryDays.map((day, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Day {day.day}</span>
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(idx)}
                      disabled={itineraryDays.length === 1}
                      className="text-red-600 hover:text-red-800 disabled:opacity-30"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="Day title"
                    value={day.title}
                    onChange={(e) => updateItineraryDay(idx, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="Day description"
                    value={day.description}
                    onChange={(e) => updateItineraryDay(idx, 'description', e.target.value)}
                  />
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={addItineraryDay}>
                + Add Day
              </Button>
            </div>
          </div>

          {/* Inclusions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Inclusions
            </h3>
            <div className="space-y-2">
              {formData.inclusions.map((inc, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={inc}
                    onChange={(e) => updateInclusion(idx, e.target.value)}
                    placeholder="e.g., Flight Ticket, Hotel Accommodation"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeInclusion(idx)}
                    disabled={formData.inclusions.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={addInclusion}>
                + Add Inclusion
              </Button>
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Exclusions</h3>
            <div className="space-y-2">
              {formData.exclusions.map((exc, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={exc}
                    onChange={(e) => updateExclusion(idx, e.target.value)}
                    placeholder="e.g., Visa Fee, Travel Insurance"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeExclusion(idx)}
                    disabled={formData.exclusions.length === 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={addExclusion}>
                + Add Exclusion
              </Button>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Featured Tour</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Feature this tour</span>
              <span className="text-xs text-gray-500">(Appears on homepage and featured sections)</span>
            </label>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">SEO Settings</h3>
            <Input
              label="SEO Title"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
            />
            <Input
              label="SEO Description"
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
            />
            <Input
              label="SEO Keywords"
              value={formData.seoKeywords}
              onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
              placeholder="tour, travel, vacation, ..."
            />
          </div>
        </form>
        <div className="flex gap-2 mt-6 border-t pt-4">
          <Button
            loading={createMutation.loading || updateMutation.loading}
            onClick={handleSubmit}
            className="flex-1"
          >
            {editingId ? 'Update Tour' : 'Create Tour'}
          </Button>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}