import {
  AuthResponse,
  LoginCredentials,
  DashboardStats,
  Service,
  Tour,
  ToursResponse,
  Booking,
  BookingStatus,
  CreateBookingRequest,
  BlogPost,
  BlogCategory,
  ContactMessage,
  CreateContactRequest,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Simple in-memory cache for GET requests
 */
const cache = new Map<string, any>();

/**
 * In-flight request tracking to prevent duplicate requests
 */
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Retry logic with exponential backoff
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to add timeout to fetch requests
 */
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 15000) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Generic API request handler with caching, retry logic, and smart error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers && typeof options.headers === 'object') {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Check cache for GET requests
  const method = options.method || 'GET';
  const cacheKey = `${method}:${endpoint}`;
  
  // Return cached data for GET requests
  if (method === 'GET' && cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Prevent duplicate in-flight requests (request deduplication)
  if (method === 'GET' && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // Execute request with retry logic
  const requestPromise = executeWithRetry<T>(url, {
    ...options,
    headers,
  }, cacheKey, method);

  // Track in-flight GET requests
  if (method === 'GET') {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  try {
    const data = await requestPromise;
    return data;
  } catch (err: any) {
    // Enhance error message for debugging
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      const enhancedError = new Error(
        `Network error: Unable to connect to ${url}. ` +
        `Ensure the backend server is running. ` +
        `Check NEXT_PUBLIC_API_URL=${API_URL}`
      );
      enhancedError.cause = err;
      throw enhancedError;
    }
    throw err;
  } finally {
    // Clean up in-flight request tracking
    if (method === 'GET') {
      inFlightRequests.delete(cacheKey);
    }
  }
}

/**
 * Execute request with exponential backoff retry logic
 */
async function executeWithRetry<T>(
  url: string,
  options: RequestInit,
  cacheKey: string,
  method: string,
  retries: number = 2,
  backoffMs: number = 2000
): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, options, 15000);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {}
      
      // Build error message with status for proper retry filtering
      const statusErrorMsg = `API error: ${response.status}`;
      
      // Handle rate limiting - wait and retry once
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        let waitTime = 5000; // Default 5 second wait for rate limiting
        
        if (retryAfter) {
          if (!isNaN(parseInt(retryAfter))) {
            waitTime = parseInt(retryAfter) * 1000;
          } else {
            const retryDate = new Date(retryAfter);
            waitTime = Math.max(2000, retryDate.getTime() - Date.now());
          }
        }
        
        // Wait and retry once - don't throw immediately
        console.warn(`Rate limited (${response.status}). Waiting ${waitTime}ms before retrying...`);
        await sleep(waitTime);
        
        // Retry after waiting (use last retry for rate limits)
        if (retries > 0) {
          return executeWithRetry<T>(url, options, cacheKey, method, retries - 1, backoffMs);
        }
        
        // If no retries left, throw
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      
      // Don't retry client errors (400-499) - these are intentional responses
      if (response.status >= 400 && response.status < 500) {
        throw new Error(errorData.message || statusErrorMsg);
      }
      
      // For server errors (5xx), throw with "API error" prefix to allow retry
      throw new Error(statusErrorMsg);
    }

    const data = await response.json();

    // Cache GET requests
    if (method === 'GET') {
      cache.set(cacheKey, data);
    }

    return data;
  } catch (err: any) {
    // Only retry on network errors (like "Failed to fetch"), not API errors
    const isNetworkError = err instanceof TypeError && err.message === 'Failed to fetch';
    if (retries > 0 && isNetworkError) {
      const waitTime = backoffMs * Math.pow(2, 2 - retries);
      console.warn(`Request failed: ${err.message}. Retrying in ${waitTime}ms...`);
      await sleep(waitTime);
      return executeWithRetry<T>(url, options, cacheKey, method, retries - 1, backoffMs);
    }
    throw err;
  }
}

/**
 * Clear the request cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Authentication API
 */
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: (): Promise<User> =>
    apiRequest<User>('/auth/me', { method: 'GET' }),

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },
};

/**
 * Services API
 */
export const servicesAPI = {
  getAll: (): Promise<Service[]> =>
    apiRequest<Service[]>('/services', { method: 'GET' }),

  getOne: (id: string): Promise<Service> =>
    apiRequest<Service>(`/services/${id}`, { method: 'GET' }),

  getBySlug: (slug: string): Promise<Service> =>
    apiRequest<Service>(`/services/slug/${slug}`, { method: 'GET' }),

  create: (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> =>
    apiRequest<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Service> =>
    apiRequest<Service>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/services/${id}`, { method: 'DELETE' }),
};

/**
 * Tours API
 */
export const toursAPI = {
  getAll: (params?: {
    page?: string;
    limit?: string;
    status?: string;
    destination?: string;
    featured?: boolean;
  }): Promise<ToursResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page);
    if (params?.limit) searchParams.set('limit', params.limit);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.destination) searchParams.set('destination', params.destination);
    if (params?.featured !== undefined) searchParams.set('featured', String(params.featured));
    const url = searchParams.toString() ? `/tours?${searchParams}` : '/tours';
    return apiRequest<ToursResponse>(url, { method: 'GET' });
  },

  getOne: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${id}`, { method: 'GET' }),

  getBySlug: (slug: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/slug/${slug}`, { method: 'GET' }),

  getStats: (): Promise<DashboardStats> =>
    apiRequest<DashboardStats>('/tours/stats', { method: 'GET' }),

  search: (query: string, limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/search?q=${query}&limit=${limit}` : `/tours/search?q=${query}`;
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getFeatured: (limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/featured?limit=${limit}` : '/tours/featured';
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getByStatus: (status: string, limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/status/${status}?limit=${limit}` : `/tours/status/${status}`;
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getByDestination: (destination: string, limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/destination/${destination}?limit=${limit}` : `/tours/destination/${destination}`;
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  create: (data: Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'bookingsCount'>): Promise<Tour> =>
    apiRequest<Tour>('/tours', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'bookingsCount'>>): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  publish: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${id}/publish`, { method: 'PATCH' }),

  unpublish: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${id}/unpublish`, { method: 'PATCH' }),

  toggleFeatured: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${id}/feature`, { method: 'PATCH' }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/tours/${id}`, { method: 'DELETE' }),
};

/**
 * Bookings API
 */
export const bookingsAPI = {
  getAll: (params?: {
    page?: string;
    limit?: string;
    status?: string;
    tourId?: string;
  }): Promise<{ data: Booking[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page);
    if (params?.limit) searchParams.set('limit', params.limit);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.tourId) searchParams.set('tourId', params.tourId);
    const url = searchParams.toString() ? `/bookings?${searchParams}` : '/bookings';
    return apiRequest(url, { method: 'GET' });
  },

  getOne: (id: string): Promise<Booking> =>
    apiRequest<Booking>(`/bookings/${id}`, { method: 'GET' }),

  getByReference: (referenceNo: string): Promise<Booking> =>
    apiRequest<Booking>(`/bookings/reference/${referenceNo}`, { method: 'GET' }),

  create: (data: CreateBookingRequest): Promise<Booking> =>
    apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: BookingStatus): Promise<Booking> =>
    apiRequest<Booking>(`/bookings/${id}/status?status=${status}`, {
      method: 'PATCH',
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/bookings/${id}`, { method: 'DELETE' }),
};

/**
 * Categories API
 */
export const categoriesAPI = {
  getAll: (): Promise<BlogCategory[]> =>
    apiRequest<BlogCategory[]>('/categories', { method: 'GET' }),

  getOne: (id: string): Promise<BlogCategory> =>
    apiRequest<BlogCategory>(`/categories/${id}`, { method: 'GET' }),

  getBySlug: (slug: string): Promise<BlogCategory> =>
    apiRequest<BlogCategory>(`/categories/slug/${slug}`, { method: 'GET' }),

  create: (data: Omit<BlogCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogCategory> =>
    apiRequest<BlogCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<BlogCategory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BlogCategory> =>
    apiRequest<BlogCategory>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/categories/${id}`, { method: 'DELETE' }),
};

/**
 * Blog API
 */
export const blogAPI = {
  /**
   * Get published posts only (for public blog page)
   * Supports optional filtering by categoryId
   */
  getPublic: (categoryId?: string): Promise<BlogPost[]> => {
    const url = categoryId ? `/blog/public?categoryId=${categoryId}` : '/blog/public';
    return apiRequest<BlogPost[]>(url, { method: 'GET' });
  },

  /**
   * Get all posts including drafts (for admin)
   */
  getAdmin: (): Promise<BlogPost[]> =>
    apiRequest<BlogPost[]>('/blog/admin', { method: 'GET' }),

  /**
   * Deprecated: Use getPublic() or getAdmin() instead
   */
  getAll: (): Promise<BlogPost[]> =>
    apiRequest<BlogPost[]>('/blog', { method: 'GET' }),

  getOne: (id: string): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/blog/${id}`, { method: 'GET' }),

  getBySlug: (slug: string): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/blog/slug/${slug}`, { method: 'GET' }),

  create: (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> =>
    apiRequest<BlogPost>('/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/blog/${id}`, { method: 'DELETE' }),
};

/**
 * Contacts API
 */
export const contactsAPI = {
  getAll: (): Promise<ContactMessage[]> =>
    apiRequest<ContactMessage[]>('/contacts', { method: 'GET' }),

  getOne: (id: string): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${id}`, { method: 'GET' }),

  create: (data: CreateContactRequest): Promise<ContactMessage> =>
    apiRequest<ContactMessage>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markAsRead: (id: string): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${id}/read`, { method: 'PATCH' }),

  respond: (id: string, response: string): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/contacts/${id}`, { method: 'DELETE' }),
};

/**
 * Users API
 */
export const usersAPI = {
  getAll: (): Promise<User[]> =>
    apiRequest<User[]>('/users', { method: 'GET' }),

  getOne: (id: string): Promise<User> =>
    apiRequest<User>(`/users/${id}`, { method: 'GET' }),

  create: (data: Omit<User, 'id' | 'createdAt'>): Promise<User> =>
    apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> =>
    apiRequest<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/users/${id}`, { method: 'DELETE' }),
};

/**
 * Admin API
 */
export const adminAPI = {
  getStats: (): Promise<DashboardStats> =>
    apiRequest<DashboardStats>('/admin/stats', { method: 'GET' }),
};