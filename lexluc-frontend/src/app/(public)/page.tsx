import { Metadata } from 'next';
import HeroSlider from '@/components/home/HeroSlider';
import AnimatedStats from '@/components/home/AnimatedStats';
import DynamicServicesSection from '@/components/home/DynamicServicesSection';
import DynamicToursSection from '@/components/home/DynamicToursSection';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';
import CtaSection from '@/components/home/CtaSection';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Home | Lexluc Global Services and Tours Limited',
  description: SITE_CONFIG.description,
  openGraph: {
    title: 'Lexluc Global Services and Tours Limited',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <AnimatedStats />
      <DynamicServicesSection />
      <DynamicToursSection />
      <BlogPreviewSection />
      <CtaSection />
    </div>
  );
}
