'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const heroSlides = [
  {
    id: 1,
    title: 'Tourism',
    subtitle: 'Discover unforgettable destinations with our world-class tour experiences',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Agriculture',
    subtitle: 'Sustainable farming solutions for a prosperous future',
    image: 'https://res.cloudinary.com/dsrboapnp/image/upload/v1780174670/lexluc/services/qssakv904mjsmvhrgr9x.png',
  },
  {
    id: 3,
    title: 'Mining',
    subtitle: 'Advanced extraction technologies for valuable resources',
    image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Oil & Gas',
    subtitle: 'Energy solutions powering industries worldwide',
    image: 'https://res.cloudinary.com/dsrboapnp/image/upload/v1780174612/lexluc/services/lf1alcn7jxlzo7a1hxge.png',
  },
  {
    id: 5,
    title: 'Recreation',
    subtitle: 'Premium recreational facilities for leisure and wellness',
    image: 'https://res.cloudinary.com/dsrboapnp/image/upload/v1780174925/lexluc/services/c4infg4vbmrp3reuckar.png',
  },
  {
    id: 6,
    title: 'Transportation & Logistics',
    subtitle: 'Efficient supply chain solutions across global markets',
    image: 'https://res.cloudinary.com/dsrboapnp/image/upload/v1780175008/lexluc/services/w0fzrffdxc3lrvwpjycy.png',
  },
];

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          el: '.swiper-pagination',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} w-3 h-3 bg-white/50 rounded-full transition-all duration-300 hover:bg-white"></span>`;
          },
        }}
        loop={true}
        speed={1000}
        className="h-full w-full"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 mix-blend-overlay" />

              <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight"
                    >
                      <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Lexluc Global Services
                      </span>
                      <span className="block text-white/90 mt-2">and Tours</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-lg sm:text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed"
                    >
                      Excellence in Tourism, Agriculture, Mining, Oil & Gas, Recreation, Transportation & Logistics
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                    >
                      <Link
                        href="/services"
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-900 bg-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Explore Services
                          <motion.span
                            className="inline-block"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 3 }}
                          >
                            →
                          </motion.span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>

                      <Link
                        href="/contact"
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-full overflow-hidden transition-all duration-300 hover:bg-white hover:text-blue-900 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                      >
                        <span className="relative z-10">Contact Us</span>
                        <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors duration-300 group">
        <svg
          className="w-6 h-6 text-white transition-transform duration-300 group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button className="swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors duration-300 group">
        <svg
          className="w-6 h-6 text-white transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="swiper-pagination absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2" />
    </section>
  );
}