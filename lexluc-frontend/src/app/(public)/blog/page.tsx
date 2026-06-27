'use client';

import { useState } from 'react';
import { useFetch } from '@/lib/hooks';
import { blogAPI, categoriesAPI } from '@/lib/api';
import { Card, Loader, EmptyState, Badge } from '@/components/common/UI';
import Link from 'next/link';
import { BlogCategory, BlogPost } from '@/types';

export default function BlogPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: postsData, loading, error } = useFetch<BlogPost[]>(() =>
    blogAPI.getPublic(selectedCategoryId || undefined)
  );
  const { data: categoriesData } = useFetch<BlogCategory[]>(() => categoriesAPI.getAll());

  const posts = Array.isArray(postsData) ? postsData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div>
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Our Blog</h1>
          <p className="text-gray-300 mt-2">Latest articles and industry insights</p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Category:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategoryId === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                All Posts
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedCategoryId === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                  }`}
                  style={{
                    ...(selectedCategoryId === category.id && category.color && { backgroundColor: category.color }),
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <Loader />}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
              <p className="font-semibold">Error loading blog posts</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <EmptyState
              icon="📝"
              title={selectedCategoryId ? 'No Blog Posts in This Category' : 'No Blog Posts Yet'}
              description={selectedCategoryId ? 'Try selecting a different category.' : 'Check back soon for insightful articles and industry updates.'}
            />
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden flex flex-col">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-48 object-cover w-full"
                    />
                  ) : (
                    <div className="bg-gray-300 h-48 flex items-center justify-center text-6xl">
                      📰
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    {post.category && <Badge variant="info">{post.category.name}</Badge>}
                    {(post.tags || []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="default" className="mr-2 text-xs">{tag}</Badge>
                    ))}
                    <h3 className="text-xl font-bold mt-2 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString()
                          : 'Recently added'}
                      </span>
                      <span>Views: {post.views || 0}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                      Read more →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
