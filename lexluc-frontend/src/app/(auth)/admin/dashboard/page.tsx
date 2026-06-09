'use client';

import { useState, useCallback, useEffect } from 'react';
import { servicesAPI, toursAPI, bookingsAPI, contactsAPI, adminAPI } from '@/lib/api';
import { DashboardStats, Booking, ContactMessage } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    services: 0,
    tours: 0,
    bookings: 0,
    posts: 0,
    unreadContacts: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentContacts, setRecentContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memoize fetchers to prevent unnecessary re-rendering
  const fetchStats = useCallback(async (): Promise<DashboardStats> => {
    return adminAPI.getStats();
    }, []);


  const fetchBookings = useCallback(async () => {
    return bookingsAPI.getAll();
  }, []);

  const fetchContacts = useCallback(async () => {
    return contactsAPI.getAll();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Single combined request for stats + separate requests for recent data
        const [statsData, bookingsData, contactsData] = await Promise.all([
          fetchStats(),
          fetchBookings(),
          fetchContacts(),
        ]);

        setStats(statsData);

        setRecentBookings(
          Array.isArray(bookingsData) ? bookingsData.slice(0, 5) : []
        );
        setRecentContacts(
          Array.isArray(contactsData) ? contactsData.slice(0, 5) : []
        );
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchStats, fetchBookings, fetchContacts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Users', value: stats.users, icon: '👥', color: 'blue' },
          { label: 'Services', value: stats.services, icon: '🛠️', color: 'blue' },
          { label: 'Tours', value: stats.tours, icon: '🗺️', color: 'purple' },
          { label: 'Bookings', value: stats.bookings, icon: '📅', color: 'green' },
          { label: 'Blog Posts', value: stats.posts, icon: '📝', color: 'orange' },
          { label: 'Unread Messages', value: stats.unreadContacts, icon: '💬', color: 'red' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
<p className="font-semibold text-gray-900">
                        {booking.fullName}
                       </p>
                      <p className="text-sm text-gray-600">
                        Ref: {booking.referenceNo}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
          </div>
          <div className="p-6">
            {recentContacts.length > 0 ? (
              <div className="space-y-4">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        contact.isRead
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {contact.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No messages yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
