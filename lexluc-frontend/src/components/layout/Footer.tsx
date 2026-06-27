'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
import { FOOTER_LINKS, SOCIAL_LINKS, CONTACT_INFO } from '@/lib/constants';

const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'instagram':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2ZM17.6 6.7a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.94 8.98H3.64V20h3.3V8.98ZM5.29 4A1.92 1.92 0 1 1 5.3 7.86 1.92 1.92 0 0 1 5.29 4ZM20.36 13.4c0-3.3-1.76-4.84-4.12-4.84a3.55 3.55 0 0 0-3.2 1.76V8.98H9.82V20h3.25v-5.8c0-1.54.92-2.38 2.1-2.38 1.13 0 1.88.7 1.88 2.38V20h3.3Z" />
        </svg>
      );
    case 'x':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.9 2h3.08l-6.74 7.7L23.2 22h-6.2l-4.86-6.35L6.58 22H3.5l7.2-8.23L2.96 2h6.36l4.39 5.8L18.9 2Zm-1.08 17.9h1.7L8.45 4.08h-1.8Z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.6 12 3.6 12 3.6s-7.55 0-9.4.48A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.48 9.4.48 9.4.48s7.55 0 9.4-.48a3 3 0 0 0 2.1-2.12A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12Z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 7.8V4.3h-3.35A5.7 5.7 0 0 1 12.7 1.5V.5H9.35v14.1a3.35 3.35 0 1 1-3.35-3.35c.2 0 .4.02.6.05V7.84a6.85 6.85 0 1 0 6.1 6.8V10.9a2.35 2.35 0 0 0 1.65 2.24v3.2A5.7 5.7 0 0 1 9.35 20.7a6.7 6.7 0 1 1 6.7-6.7V3.65A2.35 2.35 0 0 0 21 7.8Z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="relative w-12 h-12 lg:w-14 lg:h-14">
                <Image src="/logo.png" alt="Lexluc Global Services" fill className="object-contain" sizes="(max-width: 768px) 48px, 56px" />
              </motion.div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Lexluc Global
              </span>
            </div>

            <p className="text-gray-400 text-sm lg:text-base leading-relaxed mb-6 max-w-sm">
              Excellence in Tourism, Agriculture, Mining, Oil & Gas, Recreation, Transportation & Logistics.
              Your trusted partner for global services and premium tours.
            </p>

            <div className="space-y-3 text-sm">
              {CONTACT_INFO.phoneDisplay.map((display, index) => (
                <motion.a
                  key={display}
                  href={`https://wa.me/${CONTACT_INFO.phones[index]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 5 }}
                  className="text-gray-400 flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                  <Phone size={16} className="text-blue-400" />
                  {display}
                </motion.a>
              ))}
              <motion.a href={`mailto:${CONTACT_INFO.email}`} whileHover={{ x: 5 }} className="text-gray-400 flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail size={16} className="text-blue-400" />
                {CONTACT_INFO.email}
              </motion.a>
              <motion.a href={CONTACT_INFO.mapUrl} target="_blank" rel="noopener noreferrer" whileHover={{ x: 5 }} className="text-gray-400 flex items-start gap-2 hover:text-blue-400 transition-colors">
                <MapPin size={16} className="text-blue-400 mt-1" />
                <span className="leading-tight">{CONTACT_INFO.address}</span>
              </motion.a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h4 className="text-white font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group relative text-gray-400 hover:text-white transition-colors inline-block">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px bg-blue-400 transition-all duration-300 w-0 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
            <h4 className="text-white font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group relative text-gray-400 hover:text-white transition-colors inline-block">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px bg-blue-400 transition-all duration-300 w-0 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
            <h4 className="text-white font-semibold text-lg mb-6">Legal</h4>
            <ul className="space-y-3 mb-8">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group relative text-gray-400 hover:text-white transition-colors inline-block">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px bg-blue-400 transition-all duration-300 w-0 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>

            <div>
              <h5 className="text-white font-medium mb-3">Connect With Us</h5>
              <div className="flex gap-4">
                {Object.entries(SOCIAL_LINKS).map(([platform, data]) => (
                  <motion.a
                    key={platform}
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-colors"
                    aria-label={data.label}
                    title={data.label}
                  >
                    <SocialIcon platform={platform} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.6 }} className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Lexluc Global Services and Tours Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">{CONTACT_INFO.hours}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
