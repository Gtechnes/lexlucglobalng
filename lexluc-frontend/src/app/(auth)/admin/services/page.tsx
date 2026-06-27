'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch, useMutation, useToast } from '@/lib/hooks';
import { servicesAPI } from '@/lib/api';
import { Service } from '@/types';
import { Button, Input, Badge, Modal } from '@/components/common/UI';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/common/ImageUpload';
import {
  ChevronUp, ChevronDown, Edit, Trash2, Eye, EyeOff, Search,
  Plus, X, Star, StarOff, GripVertical, Filter, RefreshCw,
  Globe, Lock, FileText, Hash, BarChart3,
  CheckCircle2, AlertCircle, Clock
} from 'lucide-react';

const serviceIcons = [
  '🏨', '🌾', '⛏️', '🛢️', '🎉', '🚚',
  '🏢', '🌍', '💼', '📊', '🔧', '📦',
  '✈️', '🚢', '🏭', '🌿', '⚡', '🏥'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function AdminServicesPage() {
  const fetchServices = useCallback(() => servicesAPI.getAll(undefined), []);
  const { data: servicesResponse, loading, refetch } = useFetch(fetchServices);
  const services = Array.isArray(servicesResponse?.data) ? servicesResponse.data : [];
  const { success, error: showError } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'published' | 'draft'>('all');
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    content: '',
    icon: '',
    image: '',
    serviceBanner: '',
    order: 0,
    isActive: true,
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    featured: false,
    features: [''],
    ctaText: 'Learn More',
    ctaLink: '/contact',
    metaTitle: '',
    metaDescription: '',
  });

  const createMutation = useMutation<Service, typeof formData>((data) => servicesAPI.create(data as any));
  const updateMutation = useMutation<Service, Partial<typeof formData>>(async (data) => {
    if (!editingId) throw new Error('No service ID');
    return servicesAPI.update(editingId, data as any);
  });

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'active' && service.isActive) ||
                           (filterStatus === 'inactive' && !service.isActive) ||
                           (filterStatus === 'published' && service.status === 'PUBLISHED') ||
                           (filterStatus === 'draft' && service.status === 'DRAFT');
      return matchesSearch && matchesStatus;
    });
  }, [services, searchQuery, filterStatus]);

  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter(s => s.isActive).length,
    inactive: services.filter(s => !s.isActive).length,
    published: services.filter(s => s.status === 'PUBLISHED').length,
    draft: services.filter(s => s.status === 'DRAFT').length,
    featured: services.filter(s => s.featured).length,
  }), [services]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      content: '',
      icon: '',
      image: '',
      serviceBanner: '',
      order: services.length,
      isActive: true,
      status: 'DRAFT',
      featured: false,
      features: [''],
      ctaText: 'Learn More',
      ctaLink: '/contact',
      metaTitle: '',
      metaDescription: '',
    });
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      slug: service.slug,
      description: service.description,
      content: service.content || '',
      icon: service.icon || '',
      image: service.image || '',
      serviceBanner: service.serviceBanner || '',
      order: service.order || 0,
      isActive: service.isActive,
      status: (service.status || 'DRAFT') as 'DRAFT' | 'PUBLISHED',
      featured: service.featured || false,
      features: service.features?.length ? service.features : [''],
      ctaText: service.ctaText || 'Learn More',
      ctaLink: service.ctaLink || '/contact',
      metaTitle: service.metaTitle || '',
      metaDescription: service.metaDescription || '',
    });
    setShowModal(true);
  };

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
  const removeFeature = (idx: number) => setFormData({
    ...formData,
    features: formData.features.filter((_, i) => i !== idx)
  });
  const updateFeature = (idx: number, value: string) => setFormData({
    ...formData,
    features: formData.features.map((f, i) => i === idx ? value : f),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Service name is required');
      return;
    }

    if (!formData.description.trim()) {
      showError('Description is required');
      return;
    }

    if (!formData.slug.trim()) {
      setFormData({ ...formData, slug: generateSlug(formData.name) });
    }

    const submitData = {
      ...formData,
      features: formData.features.filter(f => f.trim()),
    };

    try {
      if (editingId) {
        await updateMutation.mutate(submitData);
        success('Service updated successfully');
      } else {
        await createMutation.mutate(submitData);
        success('Service created successfully');
      }
      setShowModal(false);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to save service');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
    try {
      await servicesAPI.delete(id);
      success('Service deleted successfully');
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to delete service');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = services.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= services.length) return;

    const currentService = services[currentIndex];
    const swapService = services[swapIndex];

    try {
      await servicesAPI.update(currentService.id, { order: swapService.order });
      await servicesAPI.update(swapService.id, { order: currentService.order });
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to reorder services');
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await servicesAPI.update(service.id, { isActive: !service.isActive });
      success(`Service ${!service.isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to update service status');
    }
  };

  const handleToggleFeatured = async (service: Service) => {
    try {
      await servicesAPI.update(service.id, { featured: !service.featured });
      success(`Service ${!service.featured ? 'added to' : 'removed from'} featured`);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to update featured status');
    }
  };

  const handleTogglePublish = async (service: Service) => {
    try {
      const newStatus = service.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await servicesAPI.update(service.id, { status: newStatus as 'DRAFT' | 'PUBLISHED' });
      success(`Service ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Failed to update publish status');
    }
  };

  const renderPreview = (service: Service) => (
    <div className="max-h-[70vh] overflow-y-auto">
      {service.serviceBanner && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img src={service.serviceBanner} alt={service.name} className="w-full h-48 object-cover" />
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        {service.icon && <span className="text-5xl">{service.icon}</span>}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{service.name}</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant={service.isActive ? 'success' : 'default'}>
              {service.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant={service.status === 'PUBLISHED' ? 'info' : 'warning'}>
              {service.status}
            </Badge>
            {service.featured && <Badge variant="success">⭐ Featured</Badge>}
          </div>
        </div>
      </div>

      {service.image && (
        <img src={service.image} alt={service.name} className="w-full h-48 object-cover rounded-lg mb-4" />
      )}

      <p className="text-lg text-gray-600 mb-6">{service.description}</p>

      {(service.features && service.features.length > 0) && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features</h3>
          <ul className="space-y-2">
            {service.features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600">
                <span className="text-blue-500 mt-1">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {service.content && (
        <div
          className="prose prose-lg max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: service.content }}
        />
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">CTA Button:</span>
            <p className="font-medium">{service.ctaText || 'Learn More'} → {service.ctaLink || '/contact'}</p>
          </div>
          {service.metaTitle && (
            <div>
              <span className="text-gray-500">Meta Title:</span>
              <p className="font-medium">{service.metaTitle}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-500 mt-1">Manage your company services and offerings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {[
          { label: 'Total', value: stats.total, color: 'blue', icon: BarChart3 },
          { label: 'Active', value: stats.active, color: 'green', icon: Eye },
          { label: 'Inactive', value: stats.inactive, color: 'gray', icon: EyeOff },
          { label: 'Published', value: stats.published, color: 'purple', icon: Globe },
          { label: 'Draft', value: stats.draft, color: 'orange', icon: FileText },
          { label: 'Featured', value: stats.featured, color: 'yellow', icon: Star },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -2, scale: 1.02 }}
            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
            </div>
            <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, description, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {([
                { key: 'all', label: 'All', icon: Filter },
                { key: 'active', label: 'Active', icon: CheckCircle2 },
                { key: 'inactive', label: 'Inactive', icon: AlertCircle },
                { key: 'published', label: 'Published', icon: Globe },
                { key: 'draft', label: 'Draft', icon: Clock },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    filterStatus === key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No services found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first service'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <motion.table
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full"
            >
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      Order
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Visibility</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Featured</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <motion.tbody className="divide-y divide-gray-100">
                {filteredServices.map((service, index) => (
                  <motion.tr
                    key={service.id}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                    className="group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {service.order}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-12 h-12 rounded-lg object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xl">
                              {service.icon || '📋'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-xs">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {service.description}
                          </div>
                          <div className="flex gap-1 mt-1">
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {service.slug}
                            </code>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant={service.status === 'PUBLISHED' ? 'success' : 'warning'}>
                          {service.status || 'DRAFT'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                          service.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          service.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(service)}
                        className={`transition-colors ${
                          service.featured
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                        title={service.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {service.featured ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleReorder(service.id, 'up')}
                            disabled={index === 0}
                            className="disabled:opacity-20 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleReorder(service.id, 'down')}
                            disabled={index === filteredServices.length - 1}
                            className="disabled:opacity-20 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>

                        <div className="w-px h-8 bg-gray-200 mx-1" />

                        <button
                          onClick={() => setPreviewService(service)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(service)}
                          className={`p-2 rounded-lg transition-colors ${
                            service.status === 'PUBLISHED'
                              ? 'hover:bg-green-50 text-green-600'
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title={service.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        >
                          {service.status === 'PUBLISHED' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </motion.table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Service' : 'Create New Service'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
              required
              placeholder="e.g., Tourism & Hospitality"
            />
            <Input
              label="URL Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="tourism-hospitality"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <label className="block text-sm font-semibold text-blue-900 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {serviceIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-12 h-12 rounded-lg text-2xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'bg-blue-600 text-white shadow-md scale-110'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload
              label="Service Image"
              type="service"
              preview={formData.image}
              onUpload={(url) => setFormData({ ...formData, image: url })}
            />
            <ImageUpload
              label="Service Banner"
              type="service"
              preview={formData.serviceBanner}
              onUpload={(url) => setFormData({ ...formData, serviceBanner: url })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of this service..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Content (Rich Text)</label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Detailed service description with rich text formatting..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Key Features</label>
            <div className="space-y-2">
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✓</span>
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      placeholder={`Feature ${idx + 1}`}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeFeature(idx)}
                    disabled={formData.features.length === 1}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={addFeature} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Call to Action</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Button Text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Learn More"
              />
              <Input
                label="Button Link"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                placeholder="/contact"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SEO Meta Title"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="Page title for search engines"
            />
            <Input
              label="SEO Meta Description"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="Brief description for search engines"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Active</span>
                <p className="text-xs text-gray-500">Show on public website</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status === 'PUBLISHED'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'PUBLISHED' : 'DRAFT' })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Published</span>
                <p className="text-xs text-gray-500">Visible to public visitors</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Featured</span>
                <p className="text-xs text-gray-500">Highlight on homepage</p>
              </div>
            </label>
          </div>
        </form>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            loading={createMutation.loading || updateMutation.loading}
            onClick={handleSubmit}
            className="flex-1"
          >
            {editingId ? 'Update Service' : 'Create Service'}
          </Button>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const previewData = {
                ...formData,
                features: formData.features.filter(f => f.trim()),
                id: 'preview',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Service;
              setPreviewService(previewData);
            }}
          >
            Preview
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!previewService}
        onClose={() => setPreviewService(null)}
        title="Service Preview"
        size="xl"
      >
        {previewService && renderPreview(previewService)}
      </Modal>
    </div>
  );
}
