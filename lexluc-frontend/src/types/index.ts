// User and Authentication
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'BOOKING_MANAGER' | 'USER';
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Services
export type ServiceStatus = 'DRAFT' | 'PUBLISHED';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  content?: string;
  icon?: string;
  image?: string;
  serviceBanner?: string;
  order: number;
  isActive: boolean;
  status?: ServiceStatus;
  featured?: boolean;
  features?: string[];
  ctaText?: string;
  ctaLink?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Tours
export type TourStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'DRAFT' | 'PUBLISHED';

export interface TourItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Tour {
  id: string;
  title: string;
  slug: string;
  category?: string;
  destination: string;
  departureLocation?: string;
  shortDescription?: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: TourStatus;
  price: number;
  currency?: string;
  availableSlots?: number;
  discount?: number;
  featuredImage?: string;
  gallery?: string[];
  itinerary?: TourItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  // Legacy fields
  content?: string;
  duration?: number;
  maxParticipants?: number;
  highlights?: string[];
  serviceId?: string;
  service?: Service;
  createdAt: string;
  updatedAt: string;
  bookingsCount?: number;
  // Backward compatibility
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ToursResponse {
  data: Tour[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TourHomeResponse {
  featured: Tour[];
  upcoming: Tour[];
  current: Tour[];
  past: Tour[];
}

// Bookings
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface Booking {
  id: string;
  referenceNo: string;
  fullName: string;
  email: string;
  phone: string;
  numberOfTravelers: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  specialRequests?: string;
  notes?: string;
  userId?: string;
  tourId: string;
  tour?: Tour;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithTour extends Booking {
  tour: Tour;
}

export interface CreateBookingRequest {
  fullName: string;
  email: string;
  phone: string;
  numberOfTravelers: number;
  tourId: string;
  specialRequests?: string;
}

// Blog Posts
export type BlogPostStatus = 'DRAFT' | 'UNDER_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type BlogArticleType =
  | 'TRAVEL_GUIDE'
  | 'DESTINATION_SPOTLIGHT'
  | 'TOUR_HIGHLIGHTS'
  | 'TRAVEL_TIPS'
  | 'COMPANY_EXPERIENCE_STORY'
  | 'CUSTOM';
export type BlogTone = 'Professional' | 'Luxury' | 'Informative' | 'Conversational' | 'Corporate' | 'Inspirational';
export type BlogArticleLength = 'SHORT' | 'MEDIUM' | 'LONG';
export type BlogSeoFocus = 'SEO_OPTIMIZED' | 'READER_FOCUSED' | 'BALANCED';
export type BlogTargetAudience =
  | 'Families'
  | 'Tourists'
  | 'Corporate Travelers'
  | 'Students'
  | 'International Visitors'
  | 'Business Travelers';
export type BlogAssistAction =
  | 'IMPROVE_WRITING'
  | 'EXPAND_CONTENT'
  | 'SHORTEN_CONTENT'
  | 'IMPROVE_SEO'
  | 'GENERATE_META_TAGS'
  | 'GENERATE_TAGS'
  | 'GENERATE_CTA';

export interface BlogAiSourceSelection {
  tourIds?: string[];
  destination?: string;
  category?: string;
  featured?: boolean;
  upcoming?: boolean;
  completed?: boolean;
}

export interface BlogAiGenerationOptions {
  sourceSelection: BlogAiSourceSelection;
  articleType: BlogArticleType;
  customTopic?: string;
  title?: string;
  tone: BlogTone;
  articleLength: BlogArticleLength;
  seoFocus: BlogSeoFocus;
  targetAudience: BlogTargetAudience;
}

export interface GeneratedBlogDraft {
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  tags: string[];
  image: string;
  sourceTourIds: string[];
  aiGenerated: boolean;
}

export interface BlogAssistRequest {
  sourceSelection: BlogAiSourceSelection;
  action: BlogAssistAction;
  title?: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  tags?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  categoryId?: string;
  category?: BlogCategory;
  status: BlogPostStatus;
  isPublished: boolean;
  publishedAt?: string;
  scheduledFor?: string;
  aiGenerated: boolean;
  sourceTourIds: string[];
  lastAutosavedAt?: string;
  views: number;
  likes: number;
  shares: number;
  commentsCount: number;
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogStats {
  total: number;
  draft: number;
  underReview: number;
  scheduled: number;
  published: number;
  archived: number;
  views: number;
  likes: number;
  shares: number;
  mostPopular: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    shares: number;
    publishedAt?: string;
  }>;
}

export interface BlogAiSources {
  tours: Array<{
    id: string;
    title: string;
    destination: string;
    category: string;
    featured: boolean;
    status: string;
    image?: string;
  }>;
  destinations: string[];
  categories: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}
// Contact Messages
export type ContactStatus = 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED';

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  isRead: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactStats {
  total: number;
  new: number;
  inProgress: number;
  responded: number;
  closed: number;
  unread: number;
}

export interface CreateContactRequest {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  honeypot?: string;
}

// Dashboard Stats
export interface DashboardStats {
  users: number;
  services: number;
  tours: number;
  bookings: number;
  posts: number;
  unreadContacts: number;
  publishedTours?: number;
  draftTours?: number;
  featuredTours?: number;
  upcomingTours?: number;
  completedTours?: number;
  pendingBookings?: number;
  confirmedBookings?: number;
}