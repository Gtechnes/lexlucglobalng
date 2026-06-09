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
  order: number;
  isActive: boolean;
  status?: ServiceStatus;
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
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
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
  isPublished: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Contact Messages
export type ContactStatus = 'NEW' | 'READ' | 'RESPONDED';

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  isRead?: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
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