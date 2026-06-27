'use client';

import { useFetch } from '@/lib/hooks';
import { usersAPI, toursAPI, bookingsAPI, blogAPI, servicesAPI } from '@/lib/api';
import { Loader, Card } from '@/components/common/UI';
import Link from 'next/link';

export default function AdminDashboard() {
  // Fetch all data in parallel for speed
  const { data: usersData, loading: usersLoading } = useFetch(() => usersAPI.getAll());
  const { data: servicesData, loading: servicesLoading } = useFetch(() => servicesAPI.getAll());
  const { data: toursData, loading: toursLoading } = useFetch(() => toursAPI.getAll());
  const { data: bookingsData, loading: bookingsLoading } = useFetch(() => bookingsAPI.getAll());
  const { data: postsData, loading: postsLoading } = useFetch(() => blogAPI.getAll());

  const users = Array.isArray(usersData) ? usersData : [];
  const tours = Array.isArray(toursData) ? toursData : [];
  const bookings = Array.isArray(bookingsData) ? bookingsData : [];
  const posts = Array.isArray(postsData) ? postsData : [];
  const services = Array.isArray(servicesData) ? servicesData : [];

  const loading = usersLoading || toursLoading || bookingsLoading || postsLoading || servicesLoading;

  const stats = [
    {
      label: 'Total Users',
      value: users.length || 0,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      link: '/admin/users',
    },
    {
      label: 'Total Services',
      value: services.length || 0,
      icon: '🛎️',
      color: 'from-green-500 to-green-600',
      link: '/admin/services',
    },
    {
      label: 'Total Tours',
      value: tours.length || 0,
      icon: '✈️',
      color: 'from-purple-500 to-purple-600',
      link: '/admin/tours',
    },
    {
      label: 'Total Bookings',
      value: bookings.length || 0,
      icon: '📅',
      color: 'from-orange-500 to-orange-600',
      link: '/admin/bookings',
    },
    {
      label: 'Blog Posts',
      value: posts.length || 0,
      icon: '📝',
      color: 'from-red-500 to-red-600',
      link: '/admin/blog',
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {stats.map((stat) => (
          <Link key={stat.link} href={stat.link}>
            <div className={`bg-gradient-to-br ${stat.color} rounded-lg shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-shadow h-full`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="opacity-90 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl opacity-20">{stat.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/services" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <h3 className="font-semibold text-gray-900 mb-2">🛎️ Manage Services</h3>
              <p className="text-sm text-gray-600">Create, edit, and manage services</p>
            </div>
          </Link>

          <Link href="/admin/tours" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <h3 className="font-semibold text-gray-900 mb-2">📍 Manage Tours</h3>
              <p className="text-sm text-gray-600">Create, edit, and manage tours</p>
            </div>
          </Link>

          <Link href="/admin/blog" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
              <h3 className="font-semibold text-gray-900 mb-2">📰 Manage Blog</h3>
              <p className="text-sm text-gray-600">Write and publish blog posts</p>
            </div>
          </Link>

          <Link href="/admin/bookings" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
              <h3 className="font-semibold text-gray-900 mb-2">📋 View Bookings</h3>
              <p className="text-sm text-gray-600">Track customer bookings</p>
            </div>
          </Link>

          <Link href="/admin/contacts" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all">
              <h3 className="font-semibold text-gray-900 mb-2">💬 View Messages</h3>
              <p className="text-sm text-gray-600">View contact inquiries</p>
            </div>
          </Link>

          <Link href="/admin/users" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <h3 className="font-semibold text-gray-900 mb-2">👨‍💼 Manage Users</h3>
              <p className="text-sm text-gray-600">Manage admin users</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
