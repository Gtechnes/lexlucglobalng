# Lexluc Frontend - Complete Setup Guide

This document provides complete instructions for setting up and deploying the Lexluc Global Services frontend with full backend integration and Cloudinary image management.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Configuration](#environment-configuration)
3. [Cloudinary Setup](#cloudinary-setup)
4. [Frontend Development](#frontend-development)
5. [Admin Panel Usage](#admin-panel-usage)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A running backend API (NestJS)
- A Cloudinary account (for image uploads)

### Installation

```bash
# 1. Clone/navigate to the project
cd lexluc-frontend

# 2. Install dependencies
npm install

# 3. Copy environment example and configure
cp .env.example .env.local
# Edit .env.local with your configuration (see below)

# 4. Start the development server
npm run dev
```

Visit http://localhost:3000 in your browser.

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# ===== REQUIRED =====

# Backend API URL (must match your backend server)
# Development:
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
# Production:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1

# Cloudinary Cloud Name (from your Cloudinary dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Cloudinary Upload Preset (create in Cloudinary dashboard)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# ===== OPTIONAL =====

NEXT_PUBLIC_SITE_NAME=Lexluc Global Services
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Important Notes

- **Never commit `.env.local`** - it may contain sensitive information
- All `NEXT_PUBLIC_*` variables are visible in the browser (don't use secrets here)
- The API URL should NOT have a trailing slash
- Ensure your backend is running before starting the frontend

## Cloudinary Setup

### Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account

### Step 2: Get Your Cloud Name

1. Log in to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your **Cloud Name** from the top of the dashboard
3. Add it to `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

### Step 3: Create an Unsigned Upload Preset

**Why Unsigned?** Allows frontend uploads without exposing API keys.

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets** section
3. Click **Add upload preset**
4. Configure:
   - **Name:** `lexluc` (or your choice)
   - **Unsigned mode:** Toggle ON
   - **Folder:** `lexluc` (optional but recommended)
   - **Max file size:** 10MB (recommended)
   - **Allowed file types:** Images
5. Click **Save**
6. Copy the preset name and add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

### Testing Cloudinary Setup

1. Log in to the admin panel
2. Go to **Services** → **Add Service** (or Tours/Blog)
3. Try uploading an image
4. If successful, you'll see the image preview
5. Images should appear on public pages

## Frontend Development

### Project Structure

```
lexluc-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Admin routes (protected)
│   │   │   └── admin/
│   │   │       ├── page.tsx    # Dashboard
│   │   │       ├── services/   # Service CRUD
│   │   │       ├── tours/      # Tour CRUD
│   │   │       ├── blog/       # Blog CRUD
│   │   │       ├── bookings/   # Booking management
│   │   │       ├── contacts/   # Contact management
│   │   │       └── users/      # User management
│   │   ├── (public)/           # Public routes
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── services/      # Services listing
│   │   │   ├── tours/         # Tours listing
│   │   │   ├── blog/          # Blog listing
│   │   │   ├── contact/       # Contact form
│   │   │   └── about/         # About page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── common/            # Reusable UI components
│   │   │   ├── UI.tsx         # Cards, Buttons, etc.
│   │   │   ├── ImageUpload.tsx
│   │   │   └── ToastProvider.tsx
│   │   ├── layout/            # Layout components
│   │   ├── admin/             # Admin components
│   │   └── public/            # Public components
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   ├── hooks.ts          # Custom React hooks
│   │   ├── auth.ts           # Auth utilities
│   │   ├── cloudinary.ts     # Cloudinary utilities
│   │   └── constants.ts      # App constants
│   └── types/
│       └── index.ts          # TypeScript types
```

### Key Features Implemented

#### 1. **Public Pages** (All API-driven)

- **Services Page** (`/services`)
  - Fetches from `GET /services`
  - Cards with images, description
  - Link to service details

- **Tours Page** (`/tours`)
  - Fetches from `GET /tours`
  - Price, duration, destination info
  - Booking CTA

- **Blog Page** (`/blog`)
  - Fetches from `GET /blog-posts`
  - Only shows published posts
  - Category badges

- **Contact Page** (`/contact`)
  - Form submits to `POST /contacts`
  - Validation & error handling
  - Toast notifications

#### 2. **Admin Panel** (`/admin`)

All admin routes require authentication. Login at `/admin/login`

- **Dashboard** - Shows metrics for all content types
- **Services Manager** - Full CRUD with image uploads
- **Tours Manager** - Full CRUD with image uploads & itinerary
- **Blog Manager** - Full CRUD with image uploads & publish control
- **Bookings** - View & update status
- **Contacts** - View & reply to messages
- **Users** - Manage admin accounts

#### 3. **Data Fetching Hooks**

```typescript
// Simple data fetching with auto-refetch
const { data, loading, error, refetch } = useFetch(() => servicesAPI.getAll());

// Mutations for create/update/delete
const { mutate, loading, error } = useMutation((data) => servicesAPI.create(data));

// Toast notifications
const { success, error: showError } = useToast();
```

#### 4. **Reusable Components**

All in `src/components/common/UI.tsx` and related files:

- `Card` - Content container
- `Button` - All variants (primary, secondary, danger, ghost)
- `Input` - Form input with validation
- `Textarea` - Text area with validation
- `Badge` - Status badges
- `Modal` - Dialog component
- `Table` - Data table with actions
- `Loader` - Loading spinner
- `EmptyState` - Empty state placeholder
- `ImageUpload` - Cloudinary image upload
- `Toast` - Notifications

### Styling

- **Framework:** Tailwind CSS v4
- **Colors:** Blue (primary), Green (success), Red (danger), etc.
- **Responsive:** Mobile-first design

## Admin Panel Usage

### Logging In

1. Navigate to `/admin/login`
2. Enter your admin credentials
3. Credentials are managed from the backend

### Managing Services

1. Go to **Services** in admin panel
2. Click **Add Service**
3. Fill in:
   - Name (required)
   - Slug (URL-friendly name)
   - Description (short summary)
   - Content (full details)
   - Icon (emoji or character)
   - Featured image (Cloudinary)
   - SEO metadata
4. Check **Active** to make it visible
5. Click **Create**

### Managing Tours

1. Go to **Tours** in admin panel
2. Click **Add Tour**
3. Fill in:
   - Title (required)
   - Destination (required)
   - Duration in days
   - Price in NGN
   - Max participants
   - Full description & content
   - Itinerary (day-by-day)
   - Featured image
   - Start/End dates
   - Highlights, Inclusions, Exclusions
4. Check **Active** to publish
5. Click **Create**

### Publishing Blog Posts

1. Go to **Blog** in admin panel
2. Click **New Post**
3. Write:
   - Title (required)
   - Content (required)
   - Excerpt (preview text)
   - Category
   - Featured image
   - SEO metadata
4. **Check "Publish this post"** to make it public
5. Drafts remain private until published
6. Click **Create**

### Managing Bookings

1. Go to **Bookings** in admin panel
2. Click on a booking to view details
3. Update status:
   - **PENDING** → Initial state
   - **CONFIRMED** → Customer confirmed
   - **COMPLETED** → Tour finished
   - **CANCELLED** → Booking cancelled
4. Changes sync immediately with the database

### Responding to Contact Messages

1. Go to **Contacts** in admin panel
2. Click a message to view details
3. Click **Reply**
4. Type your response
5. Click **Send Reply**
6. Customer receives your response

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Environment Variables (Production)

Update `.env.local` with production values:

```env
NEXT_PUBLIC_API_URL=https://your-production-api.com/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_prod_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_prod_upload_preset
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### Deployment Options

#### Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Update frontend"
git push origin main

# 2. Deploy via Vercel CLI or Vercel dashboard
vercel --prod
```

#### Railway

```bash
# Configuration in railway.yaml already exists
# Push to trigger deploy
git push railway main
```

#### Docker

```bash
docker build -t lexluc-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api.com/api/v1 \
  -e NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name \
  -e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset \
  lexluc-frontend
```

## Troubleshooting

### API Connection Issues

**Problem:** "API error" or "Failed to load services"

**Solution:**
1. Check NEXT_PUBLIC_API_URL in .env.local
2. Ensure backend is running
3. Check CORS settings on backend
4. Browser DevTools → Network → Check response

### Images Not Uploading

**Problem:** "Failed to upload image"

**Solution:**
1. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
2. Check NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is set
3. Verify preset exists in Cloudinary dashboard
4. Check file size < 5MB
5. Allow file type in Cloudinary settings

### Authentication Issues

**Problem:** Admin login fails or redirects to login

**Solution:**
1. Check backend is returning valid JWT tokens
2. Verify `NEXT_PUBLIC_API_URL` matches backend
3. Check browser localStorage (F12 → Application → Local Storage)
4. Look for auth errors in console

### Build Errors

**Problem:** "Cannot find module" or TypeScript errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Toast Notifications Not Showing

**Problem:** Success/error messages don't appear

**Solution:**
1. Check `<ToastProvider>` is in app layout.tsx
2. Ensure `useToast()` hook is called from client component
3. Check for console errors

### Slow Image Loading

**Solution:**
1. Cloudinary auto-optimizes images
2. Use `optimizeImageUrl()` helper for custom sizes
3. Set appropriate max file sizes in Cloudinary

## Database Schema Notes

All data models support:
- **UUIDs** for primary keys
- **Soft deletes** (deletedAt field)
- **Timestamps** (createdAt, updatedAt)
- **Slug fields** for URLs (SEO-friendly)
- **Publishing controls** (isActive, isPublished)

## API Reference

See `src/lib/api.ts` for all API methods:

```typescript
// Services
servicesAPI.getAll()
servicesAPI.getOne(id)
servicesAPI.create(data)
servicesAPI.update(id, data)
servicesAPI.delete(id)

// Tours
toursAPI.getAll()
toursAPI.getOne(id)
toursAPI.create(data)
toursAPI.update(id, data)
toursAPI.delete(id)

// Blog
blogAPI.getAll()
blogAPI.getOne(id)
blogAPI.create(data)
blogAPI.update(id, data)
blogAPI.delete(id)

// Bookings
bookingsAPI.getAll()
bookingsAPI.create(data)
bookingsAPI.updateStatus(id, status)
bookingsAPI.delete(id)

// Contacts
contactsAPI.getAll()
contactsAPI.create(data)
contactsAPI.markAsRead(id)
contactsAPI.respond(id, response)
contactsAPI.delete(id)

// Auth
authAPI.login(credentials)
authAPI.logout()
```

## Performance Tips

1. **Images:** Always use Cloudinary for optimal delivery
2. **Caching:** Backend should implement proper cache headers
3. **Pagination:** For large lists, implement pagination in future updates
4. **Code Splitting:** Next.js automatically code-splits per route

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never expose API keys in client code
- [ ] Validate inputs on both frontend and backend
- [ ] Use HTTPS in production
- [ ] Regular security updates: `npm audit fix`
- [ ] Monitor Cloudinary upload presets permissions
- [ ] Implement rate limiting on backend

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **NestJS (Backend):** https://docs.nestjs.com

---

**Last Updated:** December 30, 2025
**Frontend Version:** 0.1.0
**Node.js Version Required:** 18+
