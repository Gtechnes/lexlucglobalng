export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Lexluc Global Services',
  description: 'Lexluc Global Services and Tours Limited - Tourism, Agriculture, Mining, Oil & Gas, Recreation, Transportation & Logistics',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  locale: 'en-NG',
};

export const NAVIGATION = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/tours', label: 'Tours & Destinations' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export const SECTORS = [
  'Tourism',
  'Agriculture',
  'Mining',
  'Oil & Gas',
  'Recreation',
  'Transportation & Logistics',
];

export const FOOTER_LINKS = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/blog', label: 'Blog' },
  ],
  services: [
    { href: '/services', label: 'All Services' },
    { href: '/tours', label: 'Tours' },
    { href: '/contact', label: 'Get Quote' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
  ],
};

export const SOCIAL_LINKS = {
  instagram: {
    label: 'Instagram',
    url: 'https://www.instagram.com/lexlucglobal/',
  },
  linkedin: {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/lexluc-global-services-a5775a3b7/',
  },
  x: {
    label: 'X',
    url: 'https://x.com/lexlucglobal',
  },
  youtube: {
    label: 'YouTube',
    url: 'https://www.youtube.com/channel/UC84lAddkMxBGV1ykJLzPoWA',
  },
  tiktok: {
    label: 'TikTok',
    url: 'https://www.tiktok.com/@lexlucglobal',
  },
};

export const CONTACT_INFO = {
  email: 'Lexlucglobalservices@gmail.com',
  phones: ['2349041532442', '17042931522'],
  phoneDisplay: ['+2349041532442', '+17042931522'],
  address: '57/59 Flayket Plaza, Opposite Ago Iwoye Junction, Agric Isawo Road, Ikorodu Lagos.',
  mapUrl: 'https://maps.google.com/?q=57/59+Flayket+Plaza+Opposite+Ago+Iwoye+Junction+Agric+Isawo+Road+Ikorodu+Lagos',
  hours: 'Mon-Fri: 9:00 AM - 6:00 PM WAT',
};