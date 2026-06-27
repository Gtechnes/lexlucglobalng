'use client';

import { FormEvent, useEffect, useState, useMemo } from 'react';
import { useFetch, useToast } from '@/lib/hooks';
import { blogAPI, categoriesAPI, clearCache, toursAPI } from '@/lib/api';
import {
  BlogAiGenerationOptions,
  BlogAiSourceSelection,
  BlogAiSources,
  BlogAssistAction,
  BlogPost,
  BlogPostStatus,
  BlogCategory,
  BlogStats,
  Tour,
  ToursResponse,
} from '@/types';
import { Button, Card, Badge, Modal } from '@/components/common/UI';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { generateSlug, ensureSlug } from '@/lib/slug';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sanitizeHtml } from '@/lib/sanitize';

const initialAiOptions: BlogAiGenerationOptions = {
  sourceSelection: {},
  articleType: 'TRAVEL_GUIDE',
  tone: 'Professional',
  articleLength: 'MEDIUM',
  seoFocus: 'BALANCED',
  targetAudience: 'Tourists',
};

const initialFormData = {
  title: '',
  slug: '',
  excerpt: '',
  image: '',
  categoryId: undefined as string | undefined,
  content: '',
  status: 'DRAFT' as BlogPostStatus,
  scheduledFor: '',
  aiGenerated: false,
  sourceTourIds: [] as string[],
  metaTitle: '',
  metaDescription: '',
  seoKeywords: [] as string[],
  tags: [] as string[],
  views: 0,
  likes: 0,
  shares: 0,
  commentsCount: 0,
};

const statusOptions: BlogPostStatus[] = ['DRAFT', 'UNDER_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];
const articleTypes: BlogAiGenerationOptions['articleType'][] = [
  'TRAVEL_GUIDE',
  'DESTINATION_SPOTLIGHT',
  'TOUR_HIGHLIGHTS',
  'TRAVEL_TIPS',
  'COMPANY_EXPERIENCE_STORY',
  'CUSTOM',
];
const tones: BlogAiGenerationOptions['tone'][] = ['Professional', 'Luxury', 'Informative', 'Conversational', 'Corporate', 'Inspirational'];
const lengths: BlogAiGenerationOptions['articleLength'][] = ['SHORT', 'MEDIUM', 'LONG'];
const seoFocusOptions: BlogAiGenerationOptions['seoFocus'][] = ['SEO_OPTIMIZED', 'READER_FOCUSED', 'BALANCED'];
const audiences: BlogAiGenerationOptions['targetAudience'][] = [
  'Families',
  'Tourists',
  'Corporate Travelers',
  'Students',
  'International Visitors',
  'Business Travelers',
];

type BlogPostPayload = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'category'> & { category?: never };

const buildLocalAiSources = (items: Tour[]): BlogAiSources => ({
  tours: items.map((tour) => ({
    id: tour.id,
    title: tour.title,
    destination: tour.destination,
    category: tour.category || '',
    featured: tour.featured,
    status: tour.status,
    image: tour.featuredImage || tour.gallery?.[0] || '',
  })),
  destinations: Array.from(new Set(items.map((tour) => tour.destination).filter((destination): destination is string => typeof destination === 'string'))),
  categories: Array.from(new Set(items.map((tour) => tour.category).filter((category): category is string => typeof category === 'string'))),
});

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'An unexpected error occurred';
const asString = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;
const asStringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export default function AdminBlogPage() {
  const { data: postsData, loading, refetch } = useFetch<BlogPost[]>(() => blogAPI.getAdmin());
  const { data: categoriesData } = useFetch<BlogCategory[]>(() => categoriesAPI.getAll());
  const { data: toursData, loading: toursLoading } = useFetch<ToursResponse>(() => toursAPI.getAdmin({ limit: '100' }));
  const { data: statsData, refetch: refetchStats } = useFetch<BlogStats>(() => blogAPI.getStats());
  const posts = useMemo(() => Array.isArray(postsData) ? postsData : [], [postsData]);
  const categories = useMemo(() => Array.isArray(categoriesData) ? categoriesData : [], [categoriesData]);
  const tours = useMemo(() => Array.isArray(toursData?.data) ? toursData.data : [], [toursData]);
  const stats = statsData || ({} as BlogStats);
  const { success: showSuccess, error: showError } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiOptions, setAiOptions] = useState<BlogAiGenerationOptions>(initialAiOptions);
  const [aiSources, setAiSources] = useState<BlogAiSources>({ tours: [], destinations: [], categories: [] });
  const [aiLoading, setAiLoading] = useState(false);
  const [assistLoading, setAssistLoading] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState('');
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setAiSources(buildLocalAiSources(tours));
  }, [tours]);

  useEffect(() => {
    if (!editingId || !showModal || !formData.title.trim()) return;
    const timer = window.setTimeout(async () => {
      try {
        await blogAPI.autosave(editingId, buildPostData({ ...formData, status: formData.status === 'SCHEDULED' && !formData.scheduledFor ? 'DRAFT' : formData.status }));
        setAutosaveStatus(`Autosaved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } catch {
        setAutosaveStatus('Autosave failed');
      }
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [editingId, showModal, formData]);

  const buildSourceSelection = (override: BlogAiSourceSelection = aiOptions.sourceSelection): BlogAiSourceSelection => ({
    tourIds: override.tourIds?.length ? override.tourIds : undefined,
    destination: override.destination || undefined,
    category: override.category || undefined,
    featured: override.featured || undefined,
    upcoming: override.upcoming || undefined,
    completed: override.completed || undefined,
  });

  const buildPostData = (data = formData) => ({
    title: data.title,
    slug: ensureSlug(data.slug, data.title),
    content: data.content,
    excerpt: data.excerpt,
    image: data.image || undefined,
    categoryId: data.categoryId,
    status: data.status,
    isPublished: data.status === 'PUBLISHED',
    scheduledFor: data.status === 'SCHEDULED' && data.scheduledFor ? new Date(data.scheduledFor).toISOString() : undefined,
    aiGenerated: data.aiGenerated,
    sourceTourIds: data.sourceTourIds,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    seoKeywords: data.seoKeywords,
    tags: data.tags,
    views: data.views,
    likes: data.likes,
    shares: data.shares,
    commentsCount: data.commentsCount,
  });

  const handleSubmit = async (e?: FormEvent, statusOverride?: BlogPostStatus) => {
    if (e) e.preventDefault();

    const nextStatus = statusOverride || formData.status;
    if (!formData.title.trim()) {
      showError('Blog title is required');
      return;
    }
    if (!formData.content.trim()) {
      showError('Content is required');
      return;
    }
    if (nextStatus === 'SCHEDULED' && !formData.scheduledFor) {
      showError('Schedule date and time are required');
      return;
    }
    if (nextStatus === 'PUBLISHED' && !confirm('Publish this post now? AI-generated drafts are never published automatically without this approval.')) {
      return;
    }

    const postData = buildPostData({ ...formData, status: nextStatus });

    try {
      if (editingId) {
        await blogAPI.update(editingId, postData as unknown as Partial<BlogPostPayload>);
        showSuccess('Post updated successfully');
      } else {
        await blogAPI.create(postData as unknown as BlogPostPayload);
        showSuccess('Post saved successfully');
      }
      setShowModal(false);
      clearCache();
      refetch();
      refetchStats();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const saveWithStatus = (status: BlogPostStatus) => {
    handleSubmit(undefined, status);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);
      const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
      if (file.size > 5 * 1024 * 1024) {
        showError(`Image too large (${originalSizeMB}MB). Compressing automatically...`);
      }
      const url = await uploadToCloudinary(file, 'blog');
      return url;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setAutosaveStatus('');
    setShowModal(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      image: post.image || '',
      categoryId: post.categoryId || '',
      content: post.content,
      status: post.status,
      scheduledFor: post.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : '',
      aiGenerated: post.aiGenerated || false,
      sourceTourIds: post.sourceTourIds || [],
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      seoKeywords: post.seoKeywords || [],
      tags: post.tags || [],
      views: post.views || 0,
      likes: post.likes || 0,
      shares: post.shares || 0,
      commentsCount: post.commentsCount || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await blogAPI.delete(id);
      showSuccess('Post deleted successfully');
      refetch();
      refetchStats();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const toggleTour = (tourId: string) => {
    const selected = new Set(aiOptions.sourceSelection.tourIds || []);
    if (selected.has(tourId)) {
      selected.delete(tourId);
    } else {
      selected.add(tourId);
    }
    setAiOptions({ ...aiOptions, sourceSelection: { ...aiOptions.sourceSelection, tourIds: Array.from(selected) } });
  };

  const updateAiOption = (key: keyof BlogAiGenerationOptions, value: unknown) => {
    setAiOptions({ ...aiOptions, [key]: value });
  };

  const updateSourceOption = (key: keyof BlogAiSourceSelection, value: unknown) => {
    setAiOptions({ ...aiOptions, sourceSelection: { ...aiOptions.sourceSelection, [key]: value } });
  };

  const handleGenerate = async () => {
    setAiLoading(true);
    try {
      const generated = await blogAPI.generateAiBlog({ ...aiOptions, sourceSelection: buildSourceSelection() });
      setFormData({
        ...formData,
        title: generated.title,
        slug: generateSlug(generated.title),
        excerpt: generated.excerpt,
        image: generated.image || formData.image,
        content: generated.content,
        status: 'DRAFT',
        aiGenerated: true,
        sourceTourIds: generated.sourceTourIds,
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        seoKeywords: generated.seoKeywords,
        tags: generated.tags,
      });
      showSuccess('AI draft generated. Review and edit before publishing.');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  const handleAssist = async (action: BlogAssistAction) => {
    setAssistLoading(action);
    try {
      const result = await blogAPI.assistAiBlog({
        action,
        sourceSelection: buildSourceSelection(),
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        seoKeywords: formData.seoKeywords,
        tags: formData.tags,
      });
      if (action === 'IMPROVE_WRITING' || action === 'EXPAND_CONTENT' || action === 'SHORTEN_CONTENT') {
        setFormData({ ...formData, content: asString(result.content, formData.content) });
      }
      if (action === 'GENERATE_CTA') {
        setFormData({ ...formData, content: `${formData.content}${asString(result.content)}` });
      }
      if (action === 'IMPROVE_SEO' || action === 'GENERATE_META_TAGS') {
        setFormData({
          ...formData,
          metaTitle: asString(result.metaTitle, formData.metaTitle),
          metaDescription: asString(result.metaDescription, formData.metaDescription),
          seoKeywords: asStringArray(result.seoKeywords).length ? asStringArray(result.seoKeywords) : formData.seoKeywords,
          tags: asStringArray(result.tags).length ? asStringArray(result.tags) : formData.tags,
        });
      }
      if (action === 'GENERATE_TAGS') {
        const generatedTags = asStringArray(result.tags);
        const generatedKeywords = asStringArray(result.seoKeywords);
        setFormData({ ...formData, tags: generatedTags.length ? generatedTags : formData.tags, seoKeywords: generatedKeywords.length ? generatedKeywords : formData.seoKeywords });
      }
      showSuccess('AI assistant update applied');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setAssistLoading('');
    }
  };

  const statusBadge = (status: BlogPostStatus) => {
    const variants: Record<BlogPostStatus, 'default' | 'success' | 'warning' | 'info' | 'error'> = {
      DRAFT: 'default',
      UNDER_REVIEW: 'info',
      SCHEDULED: 'warning',
      PUBLISHED: 'success',
      ARCHIVED: 'error',
    };
    return <Badge variant={variants[status]} className="text-xs">{status.replace('_', ' ')}</Badge>;
  };

  const plainText = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const selectedTourIds = useMemo(() => new Set(formData.sourceTourIds), [formData.sourceTourIds]);
  const selectedTours = useMemo(() => tours.filter((tour: Tour) => selectedTourIds.has(tour.id)), [tours, selectedTourIds]);
  const hasAiSource = aiOptions.sourceSelection.tourIds?.length || aiOptions.sourceSelection.destination || aiOptions.sourceSelection.category || aiOptions.sourceSelection.featured || aiOptions.sourceSelection.upcoming || aiOptions.sourceSelection.completed;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600 mt-1">Create, review, schedule, and publish LexLuc Global blog content</p>
          </div>
          <Button onClick={handleAdd}>+ New Post</Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          ['Total Posts', stats?.total || posts.length],
          ['Drafts', stats?.draft || posts.filter((post: BlogPost) => post.status === 'DRAFT').length],
          ['Scheduled', stats?.scheduled || posts.filter((post: BlogPost) => post.status === 'SCHEDULED').length],
          ['Published', stats?.published || posts.filter((post: BlogPost) => post.status === 'PUBLISHED').length],
          ['Total Views', stats?.views || posts.reduce((sum: number, post: BlogPost) => sum + post.views, 0)],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </Card>
        ))}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Blog Assistant</h2>
            <p className="text-gray-600">Generate human-reviewed drafts from tour data. Publishing always requires explicit admin approval.</p>
          </div>
          <Badge variant="info">Human Review Required</Badge>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Source Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific / Multiple Tours</label>
                    <select
                      multiple
                      value={aiOptions.sourceSelection.tourIds || []}
                      onChange={(e) => updateSourceOption('tourIds', Array.from(e.target.selectedOptions, (option) => option.value))}
                      className="w-full min-h-[140px] px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      {toursLoading && <option>Loading tours...</option>}
                      {!toursLoading && tours.map((tour: Tour) => (
                        <option key={tour.id} value={tour.id}>
                          {tour.title} - {tour.destination}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                      <select
                        value={aiOptions.sourceSelection.destination || ''}
                        onChange={(e) => updateSourceOption('destination', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="">Any destination</option>
                        {aiSources.destinations.map((destination) => (
                          <option key={destination} value={destination}>{destination}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tour Category</label>
                      <select
                        value={aiOptions.sourceSelection.category || ''}
                        onChange={(e) => updateSourceOption('category', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="">Any category</option>
                        {aiSources.categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!aiOptions.sourceSelection.featured}
                          onChange={(e) => updateSourceOption('featured', e.target.checked ? true : undefined)}
                          className="w-4 h-4"
                        />
                        Featured
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!aiOptions.sourceSelection.upcoming}
                          onChange={(e) => updateSourceOption('upcoming', e.target.checked ? true : undefined)}
                          className="w-4 h-4"
                        />
                        Upcoming
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!aiOptions.sourceSelection.completed}
                          onChange={(e) => updateSourceOption('completed', e.target.checked ? true : undefined)}
                          className="w-4 h-4"
                        />
                        Completed
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Article Type</label>
                  <select
                    value={aiOptions.articleType}
                    onChange={(e) => updateAiOption('articleType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {articleTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                {aiOptions.articleType === 'CUSTOM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Topic</label>
                    <input
                      value={aiOptions.customTopic || ''}
                      onChange={(e) => updateAiOption('customTopic', e.target.value)}
                      placeholder="Best Family Vacation Destinations in Africa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                  <select
                    value={aiOptions.tone}
                    onChange={(e) => updateAiOption('tone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {tones.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Article Length</label>
                  <select
                    value={aiOptions.articleLength}
                    onChange={(e) => updateAiOption('articleLength', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {lengths.map((length) => <option key={length} value={length}>{length === 'SHORT' ? 'Short (500 words)' : length === 'MEDIUM' ? 'Medium (1000 words)' : 'Long (1500-2500 words)'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Focus</label>
                  <select
                    value={aiOptions.seoFocus}
                    onChange={(e) => updateAiOption('seoFocus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {seoFocusOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={aiOptions.targetAudience}
                    onChange={(e) => updateAiOption('targetAudience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {audiences.map((audience) => <option key={audience} value={audience}>{audience}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerate} loading={aiLoading}>Generate Blog Draft</Button>
                {[
                  ['IMPROVE_WRITING', 'Improve Writing'],
                  ['EXPAND_CONTENT', 'Expand Content'],
                  ['SHORTEN_CONTENT', 'Shorten Content'],
                  ['IMPROVE_SEO', 'Improve SEO'],
                  ['GENERATE_META_TAGS', 'Generate Meta Tags'],
                  ['GENERATE_TAGS', 'Generate Tags'],
                  ['GENERATE_CTA', 'Generate CTA'],
                ].map(([action, label]) => (
                  <Button
                    key={action}
                    variant="secondary"
                    onClick={() => handleAssist(action as BlogAssistAction)}
                    loading={assistLoading === action}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Selected Source Preview</h3>
              {!hasAiSource && <p className="text-sm text-gray-500">Choose at least one tour, destination, category, or tour group.</p>}
              <div className="space-y-3">
                {selectedTours.map((tour: Tour) => (
                  <div key={tour.id} className="flex items-start gap-3 rounded-lg bg-white p-3 border">
                    {tour.featuredImage || tour.gallery?.[0] ? (
                      <img src={tour.featuredImage || tour.gallery?.[0]} alt="" className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 rounded bg-gray-200" />
                    )}
                    <div className="min-w-0 flex-grow">
                      <p className="font-medium text-gray-900 truncate">{tour.title}</p>
                      <p className="text-xs text-gray-500">{tour.destination}{tour.category ? ` - ${tour.category}` : ''}</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: tour.featuredImage || tour.gallery?.[0] || formData.image })}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        Use image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <Card key={i} className="h-24 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">??</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600 mb-6">Generate an AI-assisted draft or create your first post manually.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={handleAdd}>Create Post</Button>
            <Button variant="secondary" onClick={() => document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' })}>Use AI Assistant</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post: BlogPost) => (
            <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center flex-wrap gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                    {statusBadge(post.status)}
                    {post.category && <Badge variant="info" className="text-xs">{post.category.name}</Badge>}
                    {post.aiGenerated && <Badge variant="success" className="text-xs">AI Draft</Badge>}
                  </div>
                  {post.image && <img src={post.image} alt={post.title} className="w-full max-w-md h-32 object-cover rounded-lg mb-3" />}
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {post.excerpt || plainText(post.content).substring(0, 160)}...
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>{post.publishedAt ? `Published: ${new Date(post.publishedAt).toLocaleDateString()}` : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}</span>
                    <span>Views: {post.views || 0}</span>
                    <span>Likes: {post.likes || 0}</span>
                    <span>Shares: {post.shares || 0}</span>
                    {post.scheduledFor && <span>Scheduled: {new Date(post.scheduledFor).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{editingId ? 'Edit Post' : 'New Blog Post'}</span>
            {statusBadge(formData.status)}
            {autosaveStatus && <span className="text-xs text-gray-500">{autosaveStatus}</span>}
          </div>
        }
        size="xl"
        actions={
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="w-full">Cancel</Button>
            <Button variant="secondary" onClick={() => saveWithStatus('DRAFT')} className="w-full">Save Draft</Button>
            <Button variant="secondary" onClick={() => saveWithStatus('UNDER_REVIEW')} className="w-full">Submit Review</Button>
            <Button variant="secondary" onClick={() => saveWithStatus('SCHEDULED')} className="w-full">Schedule</Button>
            <Button onClick={() => saveWithStatus('PUBLISHED')} className="w-full">Publish</Button>
          </div>
        }
      >
        <form id="blog-form" onSubmit={(e) => handleSubmit(e)} className="space-y-6 max-h-[78vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Blog Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const newSlug = !formData.slug ? generateSlug(title) : formData.slug;
                    setFormData({ ...formData, title, slug: newSlug });
                  }}
                  placeholder="Enter an engaging title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BlogPostStatus })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  >
                    {statusOptions.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Blog Subtitle / Summary</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A brief summary or subtitle that appears in listings..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat: BlogCategory) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Schedule Publication</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Featured Image</label>
                <div className="space-y-3">
                  {formData.image && (
                    <div className="relative inline-block">
                      <img src={formData.image} alt="Featured" className="max-w-md h-48 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        title="Remove image"
                      >
                        -
                      </button>
                    </div>
                  )}
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file);
                            setFormData({ ...formData, image: url });
                          } catch (error) {
                            showError(getErrorMessage(error));
                          }
                        }
                      }}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <span className={`px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer inline-block ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {formData.image ? 'Change Image' : uploadingImage ? 'Uploading...' : 'Upload Featured Image'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Main Content <span className="text-red-500">*</span></label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  onImageUpload={handleImageUpload}
                  minHeight="420px"
                  placeholder="Start writing your blog post..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">SEO Description</label>
                  <input
                    type="text"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">SEO Keywords</label>
                  <input
                    type="text"
                    value={formData.seoKeywords.join(', ')}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Travel, Dubai, Safari"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Travel, Tourism, Adventure"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Tour Data Sources</label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {selectedTours.length === 0 && <span className="text-sm text-gray-500">No selected tours. Use the AI source panel before generating.</span>}
                  {selectedTours.map((tour: Tour) => (
                    <button
                      key={tour.id}
                      type="button"
                      onClick={() => toggleTour(tour.id)}
                      className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-200"
                    >
                      {tour.title} -
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Content Preview</h3>
                {formData.image && <img src={formData.image} alt={formData.title || 'Preview'} className="w-full h-40 object-cover rounded-lg mb-3" />}
                <h4 className="text-xl font-bold text-gray-900 mb-2">{formData.title || 'Untitled blog post'}</h4>
                <p className="text-sm text-gray-600 mb-3">{formData.excerpt || plainText(formData.content).slice(0, 180)}</p>
                <div className="prose prose-sm max-w-none bg-white border rounded-lg p-3 max-h-80 overflow-y-auto" dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.content || '<p>No content yet.</p>') }} />
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">SEO Metadata</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">SEO Title</p>
                    <p className="font-medium">{formData.metaTitle || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">SEO Description</p>
                    <p className="font-medium">{formData.metaDescription || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Keywords</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.seoKeywords.length ? formData.seoKeywords.map((keyword) => <Badge key={keyword} variant="info" className="text-xs">{keyword}</Badge>) : <span className="text-gray-400">Not set</span>}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Analytics</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Views</p><p className="text-xl font-bold">{formData.views}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Likes</p><p className="text-xl font-bold">{formData.likes}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Shares</p><p className="text-xl font-bold">{formData.shares}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Comments</p><p className="text-xl font-bold">{formData.commentsCount}</p></div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Workflow</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2"><span className="font-semibold">1.</span><span>Generate Draft</span></li>
                  <li className="flex gap-2"><span className="font-semibold">2.</span><span>Admin Reviews</span></li>
                  <li className="flex gap-2"><span className="font-semibold">3.</span><span>Admin Edits</span></li>
                  <li className="flex gap-2"><span className="font-semibold">4.</span><span>Save Draft</span></li>
                  <li className="flex gap-2"><span className="font-semibold">5.</span><span>Admin Publishes</span></li>
                </ol>
              </Card>
            </aside>
          </div>
        </form>
      </Modal>
    </div>
  );
}
