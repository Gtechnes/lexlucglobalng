'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFetch } from '@/lib/hooks';
import { servicesAPI } from '@/lib/api';
import { Service } from '@/types';
import { Loader, Button } from '@/components/common/UI';
import { ArrowLeft, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const fetchService = useCallback(() => servicesAPI.getBySlug(slug), [slug]);
  const { data: service, loading, error } = useFetch<Service>(fetchService, [fetchService]);

  if (loading) return <Loader />;

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <div className="text-7xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The service you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/services">
            <Button size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const hasFeatures = service.features && service.features.length > 0;
  const ctaText = service.ctaText || 'Learn More';
  const ctaLink = service.ctaLink || '/contact';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 overflow-hidden"
      >
        <div className="absolute inset-0">
          {service.serviceBanner && (
            <img
              src={service.serviceBanner}
              alt={service.name}
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-blue-900/80 to-slate-900/90" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start gap-6 mb-6">
              {service.icon && (
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl shadow-2xl shrink-0"
                >
                  {service.icon}
                </motion.div>
              )}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                  {service.name}
                </h1>
                {service.featured && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm border border-yellow-400/30"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Featured Service
                  </motion.span>
                )}
              </div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-blue-100/80 max-w-3xl leading-relaxed"
            >
              {service.description}
            </motion.p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </motion.section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
              {service.image && (
                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </motion.div>
              )}

              {service.content && (
                <motion.div
                  variants={itemVariants}
                  className="prose prose-lg prose-blue max-w-none bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                  dangerouslySetInnerHTML={{ __html: service.content }}
                />
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              {hasFeatures && (
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    Key Features
                  </h3>
                  <ul className="space-y-3.5">
                    {service.features!.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />

                <div className="relative">
                  <h3 className="text-xl font-bold mb-3">Ready to Get Started?</h3>
                  <p className="text-blue-100 mb-5 text-sm leading-relaxed">
                    Contact us to learn more about this service and how we can help you achieve your goals.
                  </p>
                  <Link href={ctaLink}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        className="w-full bg-white text-blue-700 hover:bg-gray-50 font-semibold shadow-lg"
                      >
                        {ctaText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>

              {service.metaDescription && (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">About This Service</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{service.metaDescription}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
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
              Contact us today to discuss your requirements and get a customized solution for {service.name}.
            </p>
            <Link href={ctaLink}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-gray-100 px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-white/20 transition-all"
                >
                  {ctaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
