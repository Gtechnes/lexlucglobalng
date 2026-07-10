'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface ImmersiveGalleryProps {
  images: string[];
  tourTitle: string;
}

const zoomIn = {
  initial: { opacity: 0, scale: 1.1 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export default function ImmersiveGallery({ images, tourTitle }: ImmersiveGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const validImages = useMemo(() => images.filter(Boolean), [images]);

  const goToIndex = useCallback((index: number) => {
    const newIndex = (index + validImages.length) % validImages.length;
    setActiveIndex(newIndex);
  }, [validImages.length]);

  const goToPrevious = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  const goToNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          setLightboxOpen(false);
          break;
        case 'Home':
          e.preventDefault();
          goToIndex(0);
          break;
        case 'End':
          e.preventDefault();
          goToIndex(validImages.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, validImages.length, lightboxIndex, goToPrevious, goToNext, goToIndex]);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxOpen]);

  const preloadImages = useCallback((startIndex: number, count: number = 3) => {
    const imagesToPreload = validImages.slice(startIndex, startIndex + count);
    imagesToPreload.forEach((src, idx) => {
      const imgIndex = startIndex + idx;
      if (!loadedImages.has(imgIndex)) {
        const img = new window.Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(imgIndex));
        };
        img.src = src;
      }
    });
  }, [validImages, loadedImages]);

  useEffect(() => {
    preloadImages(activeIndex);
  }, [activeIndex, preloadImages]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
  };

  const handleTouch = () => {
    if (touchStart - touchEnd > 50) {
      goToNext();
    }
    if (touchStart - touchEnd < -50) {
      goToPrevious();
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const lightboxPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((lightboxIndex - 1 + validImages.length) % validImages.length);
  };

  const lightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((lightboxIndex + 1) % validImages.length);
  };

  if (validImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
        <span className="text-8xl">📸</span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full space-y-4"
      >
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              {...zoomIn}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={validImages[activeIndex]}
                alt={`${tourTitle} - Image ${activeIndex + 1}`}
                fill
                className="object-cover cursor-pointer"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                priority={activeIndex < 2}
                loading={activeIndex < 2 ? "eager" : "lazy"}
                onClick={() => openLightbox(activeIndex)}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div 
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white cursor-pointer"
                onClick={() => openLightbox(activeIndex)}
              >
                <Maximize2 className="w-5 h-5 text-gray-700" />
              </div>
            </motion.div>
          </AnimatePresence>

          {validImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {validImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeIndex === idx 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div 
            className="absolute inset-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchEndCapture={handleTouch}
          />
        </div>

        {validImages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3"
          >
            {validImages.map((img, idx) => (
              <motion.button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all duration-300 ${
                  activeIndex === idx 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${tourTitle} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80px, 120px"
                  loading="lazy"
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {validImages.length > 1 && (
                <>
                  <button
                    onClick={lightboxPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-200 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </button>

                  <button
                    onClick={lightboxNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-200 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </button>
                </>
              )}

              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">
                  {lightboxIndex + 1} of {validImages.length}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  {...zoomIn}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full max-w-5xl max-h-[80vh]"
                >
                  <Image
                    src={validImages[lightboxIndex]}
                    alt={`${tourTitle} - Full view ${lightboxIndex + 1}`}
                    fill
                    className="object-contain rounded-lg"
                    sizes="90vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {validImages.length > 4 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-5xl w-full">
                  <div className="flex gap-2 justify-center overflow-x-auto py-2 px-4">
                    {validImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden transition-all duration-200 ${
                          lightboxIndex === idx 
                            ? 'ring-2 ring-white scale-110' 
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          width={64}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}