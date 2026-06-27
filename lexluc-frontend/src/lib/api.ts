import {
  AuthResponse,
  LoginCredentials,
  DashboardStats,
  Service,
  Tour,
  TourHomeResponse,
  ToursResponse,
  Booking,
  BookingStatus,
  CreateBookingRequest,
  BlogPost,
  BlogCategory,
  BlogStats,
  BlogAiGenerationOptions,
  GeneratedBlogDraft,
  BlogAssistRequest,
  BlogAiSources,
  ContactMessage,
  ContactStatus,
  ContactStats,
  CreateContactRequest,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const DEBUG_API = process.env.NEXT_PUBLIC_API_DEBUG === 'true';

function debugLog(message: string, ...args: unknown[]) {
  if (DEBUG_API) {
    console.debug(`[API] ${message}`, ...args);
  }
}

/**
 * Simple in-memory cache for GET requests
 */
const cache = new Map<string, unknown>();

/**
 * In-flight request tracking to prevent duplicate requests
 */
const inFlightRequests = new Map<string, Promise<unknown>>();

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

async function parseResponseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Invalid JSON response from ${response.url}: ${error instanceof Error ? error.message : 'Unexpected end of JSON input'}`);
  }
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
  debugLog(`${method} ${url}`, options.body ? (() => {
    try {
      return JSON.parse(options.body as string);
    } catch {
      return options.body;
    }
  })() : '');
  
  // Return cached data for GET requests
  if (method === 'GET' && cache.has(cacheKey)) {
    debugLog(`cache hit ${method} ${url}`);
    return cache.get(cacheKey) as T;
  }

  // Prevent duplicate in-flight requests (request deduplication)
  if (method === 'GET' && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
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
  } catch (err: unknown) {
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
    // Clean up in-flight request tracking and stale GET cache after mutations
    if (method === 'GET') {
      inFlightRequests.delete(cacheKey);
    } else {
      cache.clear();
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
    debugLog(`response ${method} ${url} ${response.status}`);

    if (!response.ok) {
      const errorData = await parseResponseJson<Record<string, unknown>>(response);
      
      const statusErrorMsg = `API error: ${response.status}`;
      console.error(`[API Error] ${method} ${url}`, statusErrorMsg, errorData);
      
      // Handle rate limiting - wait and retry once
      if (response.status === 429) {
        const errorMsg = 'Server busy (rate limited). Please try again in a moment.';
        console.warn(`Rate limited (${response.status}).`);
        throw new Error(errorMsg);
      }
      
      // Don't retry client errors (400-499) - these are intentional responses
      if (response.status >= 400 && response.status < 500) {
        const message = errorData?.message
          ? (Array.isArray(errorData.message) ? errorData.message.join(', ') : String(errorData.message))
          : undefined;
        throw new Error(message || statusErrorMsg);
      }
      
      // For server errors (5xx), throw with "API error" prefix to allow retry
      throw new Error(statusErrorMsg);
    }

    const data = await parseResponseJson<T>(response);
    debugLog(`response body ${method} ${url}`, data);

    // Cache GET requests
    if (method === 'GET') {
      cache.set(cacheKey, data);
    }

    return data;
  } catch (err: unknown) {
    // Only retry on network errors (like "Failed to fetch"), not API errors
    const isNetworkError = err instanceof TypeError && err.message === 'Failed to fetch';
    if (retries > 0 && isNetworkError) {
      const waitTime = backoffMs * Math.pow(2, 2 - retries);
      const message = err instanceof Error ? err.message : 'Request failed';
      console.warn(`Request failed: ${message}. Retrying in ${waitTime}ms...`);
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
  getAll: (params?: { page?: string; limit?: string }): Promise<{ data: Service[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page);
    if (params?.limit) searchParams.set('limit', params.limit);
    const url = searchParams.toString() ? `/services?${searchParams}` : '/services';
    return apiRequest<{ data: Service[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(url, { method: 'GET' });
  },

  getPublic: (): Promise<Service[]> =>
    apiRequest<Service[]>('/services/public', { method: 'GET' }),

  getFeatured: (limit?: number): Promise<Service[]> => {
    const url = limit ? `/services/featured?limit=${limit}` : '/services/featured';
    return apiRequest<Service[]>(url, { method: 'GET' });
  },

  getStats: (): Promise<{ total: number; active: number; published: number; featured: number }> =>
    apiRequest('/services/stats', { method: 'GET' }),

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

  reorder: (id: string, newOrder: number): Promise<Service> =>
    apiRequest<Service>(`/services/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ newOrder }),
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

  getAdmin: (params?: {
    page?: string;
    limit?: string;
    status?: string;
    destination?: string;
    featured?: boolean;
    search?: string;
  }): Promise<ToursResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page);
    if (params?.limit) searchParams.set('limit', params.limit);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.destination) searchParams.set('destination', params.destination);
    if (params?.featured !== undefined) searchParams.set('featured', String(params.featured));
    if (params?.search) searchParams.set('search', params.search);
    const url = searchParams.toString() ? `/tours/admin?${searchParams}` : '/tours/admin';
    return apiRequest<ToursResponse>(url, { method: 'GET' });
  },

  getHome: (): Promise<TourHomeResponse> =>
    apiRequest('/tours/home', { method: 'GET' }),

  getPast: (limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/past?limit=${limit}` : '/tours/past';
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getCompleted: (limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/completed?limit=${limit}` : '/tours/completed';
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getCurrent: (limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/current?limit=${limit}` : '/tours/current';
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getOngoing: (limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/ongoing?limit=${limit}` : '/tours/ongoing';
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getUpcoming: (limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/upcoming?limit=${limit}` : '/tours/upcoming';
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getCategorized: (): Promise<{ past: Tour[]; current: Tour[]; upcoming: Tour[] }> =>
    apiRequest('/tours/categorized', { method: 'GET' }),

  getOne: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${encodeURIComponent(id)}`, { method: 'GET' }),

  getBySlug: (slug: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/slug/${encodeURIComponent(slug)}`, { method: 'GET' }),

  getStats: (): Promise<DashboardStats> =>
    apiRequest<DashboardStats>('/tours/stats', { method: 'GET' }),

  search: (query: string, limit?: number): Promise<Tour[]> => {
    const searchParams = new URLSearchParams({ q: query });
    if (limit) searchParams.set('limit', String(limit));
    return apiRequest<Tour[]>(`/tours/search?${searchParams}`, { method: 'GET' });
  },

  getFeatured: (limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/featured?limit=${limit}` : '/tours/featured';
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getByStatus: (status: string, limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/status/${encodeURIComponent(status)}?limit=${limit}` : `/tours/status/${encodeURIComponent(status)}`;
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  getByDestination: (destination: string, limit?: number): Promise<Tour[]> => {
    const url = limit ? `/tours/destination/${encodeURIComponent(destination)}?limit=${limit}` : `/tours/destination/${encodeURIComponent(destination)}`;
    return apiRequest<Tour[]>(url, { method: 'GET' });
  },

  create: (data: Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'bookingsCount'>): Promise<Tour> =>
    apiRequest<Tour>('/tours', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'bookingsCount'>>): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  publish: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${encodeURIComponent(id)}/publish`, { method: 'PATCH' }),

  unpublish: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${encodeURIComponent(id)}/unpublish`, { method: 'PATCH' }),

  toggleFeatured: (id: string): Promise<Tour> =>
    apiRequest<Tour>(`/tours/${encodeURIComponent(id)}/feature`, { method: 'PATCH' }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/tours/${encodeURIComponent(id)}`, { method: 'DELETE' }),
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
    apiRequest<BlogPost[]>('/blog/admin', { method: 'GET' }),

  getStats: (): Promise<BlogStats> =>
    apiRequest<BlogStats>('/blog/stats', { method: 'GET' }),

  getAiSources: (sourceSelection = {}): Promise<BlogAiSources> =>
    apiRequest<BlogAiSources>('/blog/ai/sources', {
      method: 'POST',
      body: JSON.stringify(sourceSelection),
    }),

  generateAiBlog: (data: BlogAiGenerationOptions): Promise<GeneratedBlogDraft> =>
    apiRequest<GeneratedBlogDraft>('/blog/ai/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  assistAiBlog: (data: BlogAssistRequest): Promise<Record<string, unknown>> =>
    apiRequest('/blog/ai/assist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

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

  autosave: (id: string, data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/blog/${id}/autosave`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  publish: (id: string): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/blog/${id}/publish`, {
      method: 'POST',
    }),

  archive: (id: string): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/blog/${id}/archive`, {
      method: 'POST',
    }),

  incrementViews: (id: string): Promise<BlogPost> =>
    apiRequest<BlogPost>(`/blog/${id}/increment-views`, {
      method: 'POST',
    }),

  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/blog/${id}`, { method: 'DELETE' }),
};

/**
 * Contacts API
 */
export const contactsAPI = {
  getAll: (params?: {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
    sort?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{ data: ContactMessage[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page);
    if (params?.limit) searchParams.set('limit', params.limit);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.sortDir) searchParams.set('sortDir', params.sortDir);
    const url = searchParams.toString() ? `/contacts?${searchParams}` : '/contacts';
    return apiRequest(url, { method: 'GET' });
  },

  getStats: (): Promise<ContactStats> =>
    apiRequest<ContactStats>('/contacts/stats', { method: 'GET' }),

  getOne: (id: string): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${encodeURIComponent(id)}`, { method: 'GET' }),

  create: (data: CreateContactRequest): Promise<ContactMessage> =>
    apiRequest<ContactMessage>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markAsRead: (id: string): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),

  updateStatus: (id: string, status: ContactStatus): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  respond: (id: string, response: string): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${encodeURIComponent(id)}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    }),

  close: (id: string): Promise<ContactMessage> =>
    apiRequest<ContactMessage>(`/contacts/${encodeURIComponent(id)}/close`, { method: 'PATCH' }),

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