'use client';

import Link from 'next/link';
import { Service } from '@/types';
import { Card, Badge } from '@/components/common/UI';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const bannerImage = service.serviceBanner || service.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800';
  const iconDisplay = service.icon || '🌐';
  const features = service.features?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/services/${service.slug}`}>
        <Card className="group overflow-hidden cursor-pointer h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="relative h-56 overflow-hidden">
            <img
              src={bannerImage}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl filter drop-shadow-lg">{iconDisplay}</span>
                <Badge variant="info" className="bg-white/20 text-white backdrop-blur-sm border border-white/30">
                  Service
                </Badge>
              </div>
              <h3 className="text-white text-xl font-bold leading-tight drop-shadow-md">{service.name}</h3>
            </div>
          </div>

          <div className="p-6 flex flex-col flex-grow">
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
              {service.description}
            </p>

            {features.length > 0 && (
              <div className="mb-5">
                <div className="space-y-2">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-0.5 flex-shrink-0">▸</span>
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-100">
              <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform duration-300">
                {service.ctaText || 'Learn More'}
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

