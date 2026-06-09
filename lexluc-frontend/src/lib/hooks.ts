'use client';

import { useState, useCallback, useEffect, DependencyList } from 'react';

/**
 * Generic data fetching hook with loading, error, and empty states
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      let errorMsg = err.message || err.toString() || 'An error occurred';
      
      // Handle network errors
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMsg = `Network error: Cannot connect to the backend server. ` +
          `Please ensure the backend is running at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}.`;
      }
      
      setError(errorMsg);
      console.error('Fetch error details:', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        cause: err?.cause,
        url: process.env.NEXT_PUBLIC_API_URL,
        errorObject: err,
      });
    } finally {
      setLoading(false);
    }
  }, [fetcher, ...deps]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refetch = useCallback(() => fetch(), [fetch]);

  return { data, loading, error, refetch };
}

/**
 * Mutation hook for POST/PATCH/DELETE operations
 */
export function useMutation<TData, TRequest>(
  mutator: (data: TRequest) => Promise<TData>
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (payload: TRequest) => {
      try {
        setLoading(true);
        setError(null);
        console.log('Mutation payload:', payload);
        const result = await mutator(payload);
        console.log('Mutation result:', result);
        setData(result);
        return result;
      } catch (err: any) {
        let errorMsg = err.message || err.toString() || 'An error occurred';
        
        // Handle network errors with detailed message
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          errorMsg = `Network error: Cannot connect to the backend server. ` +
            `Please ensure the backend is running at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}. ` +
            `Or check if you need to log in.`;
        } else if (err?.response) {
          errorMsg = `Server error: ${err.response.status} ${err.response.statusText}`;
        } else if (err?.errors) {
          errorMsg = JSON.stringify(err.errors);
        }
        
        setError(errorMsg);
        console.error('Mutation error details:', {
          message: err?.message,
          name: err?.name,
          stack: err?.stack,
          cause: err?.cause,
          url: process.env.NEXT_PUBLIC_API_URL,
          response: err?.response,
          errors: err?.errors,
          payload,
          errorObject: err,
        });
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, mutate, reset };
}

/**
 * Toast notification management
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toastSubscribers = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Subscribe to toast changes
    const subscriber = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    toastSubscribers.add(subscriber);

    return () => {
      toastSubscribers.delete(subscriber);
    };
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = String(toastId++);
      const newToast: Toast = { id, message, type };
      toasts = [...toasts, newToast];
      toastSubscribers.forEach((sub) => sub(toasts));

      if (duration > 0) {
        setTimeout(() => {
          toasts = toasts.filter((t) => t.id !== id);
          toastSubscribers.forEach((sub) => sub(toasts));
        }, duration);
      }

      return id;
    },
    []
  );

  const remove = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    toastSubscribers.forEach((sub) => sub(toasts));
  }, []);

  return {
    toasts: currentToasts,
    show,
    remove,
    success: (msg: string, duration?: number) => show(msg, 'success', duration),
    error: (msg: string, duration?: number) => show(msg, 'error', duration),
    info: (msg: string, duration?: number) => show(msg, 'info', duration),
    warning: (msg: string, duration?: number) => show(msg, 'warning', duration),
  };
}

/**
 * Auth state management hook
 */
export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string; firstName: string; lastName: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load user and token from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: { id: string; email: string; firstName: string; lastName: string; role: string }) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, login, logout, isAuthenticated: !!token };
}