/**
 * HTML Sanitization & Rendering utilities
 * Uses DOMPurify to prevent XSS attacks
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Only allows safe HTML tags and attributes for blog content
 */
export function sanitizeHtml(html: string): string {
  const config = {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
      'span',
      'div',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|webcal|chrome-extension):|[^a-z]|[a-z+.\-]*(?:[^a-z+.\-:]|$))/i,
  };

  return DOMPurify.sanitize(html, config);
}

/**
 * Convert array of classes to string
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
