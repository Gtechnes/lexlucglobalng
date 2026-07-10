/**
 * Authentication utilities for the frontend
 */

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = (): void => {
  removeAuthToken();
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

export const hasRole = (role: string): boolean => {
  const user = getStoredUser();
  return user?.role === role;
};

export const hasAnyRole = (roles: string[]): boolean => {
  const user = getStoredUser();
  return roles.includes(user?.role);
};
