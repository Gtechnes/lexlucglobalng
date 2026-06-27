'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFetch } from '@/lib/hooks';
import { servicesAPI } from '@/lib/api';
import { Loader, Button } from '@/components/common/UI';
import { Sparkles, Shield, Clock, Users, ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  hover: {
    y: -12,
    scale: 1.02,
    transition: { duration: 0.3 },
  },
} as const;

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } },
  hover: {
    scale: 1.15,
    rotate: 5,
    transition: { type: 'spring', stiffness: 400 },
  },
} as const;

const statsVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5,
    },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ServicesPage() {
  const fetchServices = useCallback(() => servicesAPI.getPublic(), []);
  const { data: servicesData, loading, error } = useFetch(fetchServices, [fetchServices]);
  const services = Array.isArray(servicesData) ? servicesData.filter(s => s.isActive) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-24 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />

          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDkwKSI+PHBhdGggZD0iTTEgMWw0MCA0MHY2MEgxeiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm font-medium mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              Premium Business Solutions
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Our Services
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed"
            >
              Comprehensive solutions across multiple industries, tailored to drive growth and deliver exceptional results for your business.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 mt-12"
            >
              {[
                { icon: Users, label: 'Expert Team' },
                { icon: Shield, label: 'Trusted Partner' },
                { icon: Clock, label: '24/7 Support' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-blue-100/80 bg-white/5 px-4 py-2 rounded-full">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </motion.section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="h-52 bg-gray-200 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                    <div className="space-y-2 pt-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-3 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl text-center"
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Unable to load services</h3>
              <p className="text-red-600/80">{error}</p>
                <Button variant="ghost" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </motion.div>
          )}

          {!loading && !error && services.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-7xl mb-6">🚀</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Services Coming Soon</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We're curating an exceptional range of services for you. Please check back soon.
              </p>
            </motion.div>
          )}

          {!loading && !error && services.length > 0 && (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {service.image && (
                      <motion.div
                        className="relative h-52 overflow-hidden"
                        initial={{ scale: 1.1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {service.featured && (
                          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </div>
                        )}

                        <motion.div
                          className="absolute bottom-4 left-4"
                          variants={iconVariants}
                          initial="hidden"
                          whileHover="hover"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-lg">
                            {service.icon || '📋'}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {!service.image && (
                      <div className="relative p-6 pb-0">
                        <motion.div
                          variants={iconVariants}
                          initial="hidden"
                          whileHover="hover"
                          className="inline-flex"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                            {service.icon || '📋'}
                          </div>
                        </motion.div>
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {service.name}
                        </h3>
                      </div>

                      <p className="text-gray-600 mb-5 flex-grow leading-relaxed line-clamp-3">
                        {service.description}
                      </p>

                      {(service.features && service.features.length > 0) && (
                        <ul className="mb-5 space-y-2.5">
                          {service.features.slice(0, 4).map((feature: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2.5">
                              <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <span className="text-xs">✓</span>
                              </span>
                              <span className="line-clamp-1">{feature}</span>
                            </li>
                          ))}
                          {service.features.length > 4 && (
                            <li className="text-xs text-blue-600 font-medium pl-7.5">
                              +{service.features.length - 4} more features
                            </li>
                          )}
                        </ul>
                      )}

                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mt-auto group/link"
                      >
                        {service.ctaText || 'Learn More'}
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Contact us today to discuss your requirements and get a customized solution tailored to your business needs.
            </p>
            <Link href="/contact">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                    <Button
                      size="lg"
                      className="bg-white text-blue-900 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-white/20 transition-all"
                    >
                      Request a Quote
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
