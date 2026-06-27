'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { blogAPI } from '@/lib/api';
import { Card, Badge } from '@/components/common/UI';
import { BlogPost } from '@/types';

const extractFirstImage = (content: string = ''): string | undefined => {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  return match?.[1];
};

export default function BlogPreviewSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogAPI
      .getPublic()
      .then((data) => setPosts(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-blue-600 font-semibold mb-2">Featured Articles</p>
            <h2 className="text-3xl font-bold text-gray-900">Latest from LexLuc Global</h2>
            <p className="text-gray-600 mt-2">Travel guides, destination spotlights, and expert tips for your next journey.</p>
          </div>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap">
            View all posts →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {loading
            ? [1, 2, 3].map((item) => <Card key={item} className="h-72 animate-pulse" />)
            : posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow">
                    {(post.image || extractFirstImage(post.content)) ? (
                      <img
                        src={post.image || extractFirstImage(post.content)}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-4xl">📝</div>
                    )}
                    <div className="p-6">
                      {post.category && <Badge variant="info" className="mb-3">{post.category.name}</Badge>}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 160)}
                      </p>
                      {(post.tags || []).slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="default" className="mr-2 text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
