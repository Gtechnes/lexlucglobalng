# Lexluc Global Services and Tours Limited - Platform

A complete, production-ready web platform for Lexluc Global Services and Tours Limited, built with Next.js, NestJS, PostgreSQL, and Prisma.

## 📋 Project Overview

**Company**: Lexluc Global Services and Tours Limited  
**Sectors**: Tourism, Agriculture, Mining, Oil & Gas, Recreation, Transportation & Logistics  
**Status**: In Development  
**Current WordPress Site**: Will remain on production; this platform will run on subdomain

## 🏗 Architecture Overview

```
lexluc-platform/
├── lexluc-frontend/          # Next.js frontend (Vercel)
├── lexluc-backend/           # NestJS backend API (Railway/Render)
├── shared/                   # Shared types & utilities
├── docs/                     # Documentation & deployment guides
└── package.json              # Monorepo configuration
```

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **SEO**: Next.js metadata, OpenGraph, schema.org

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Deployment**: Railway/Render

### Database
- **Host**: Supabase/Neon
- **ORM**: Prisma
- **Design**: PostgreSQL with UUIDs, soft deletes, timestamps

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 14+ (local dev) or Supabase account
- Git

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd lexluc-platform
```

#### 2. Install dependencies
```bash
# Frontend
cd lexluc-frontend
npm install

# Backend
cd ../lexluc-backend
npm install

# Root (optional monorepo setup)
cd ..
npm install
```

#### 3. Set up environment variables

**Frontend** (`lexluc-frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Backend** (`lexluc-backend/.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/lexluc_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

#### 4. Set up database

```bash
cd lexluc-backend
npx prisma migrate dev --name init
npx prisma db seed  # If seed file exists
```

### Development

#### Run Frontend
```bash
cd lexluc-frontend
npm run dev
# Opens at http://localhost:3000
```

#### Run Backend
```bash
cd lexluc-backend
npm run start:dev
# Runs at http://localhost:3001
```

#### Database Studio
```bash
cd lexluc-backend
npx prisma studio
# Opens at http://localhost:5555
```

## 📁 Project Structure

### Frontend (`lexluc-frontend/`)
```
src/
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── (public)/
│   │   ├── about/               # About Us
│   │   ├── services/            # Services listing
│   │   ├── tours/               # Tours listing
│   │   ├── destinations/        # Tour destinations
│   │   ├── blog/                # Blog posts
│   │   ├── careers/             # Careers page
│   │   ├── contact/             # Contact page
│   │   ├── case-studies/        # Case studies
│   │   ├── privacy/             # Privacy policy
│   │   └── terms/               # Terms & conditions
│   ├── (auth)/
│   │   └── admin/
│   │       ├── login/           # Admin login
│   │       └── layout.tsx       # Admin layout
│   └── api/                     # API routes (if needed)
├── components/
│   ├── common/                  # Shared components
│   ├── admin/                   # Admin components
│   ├── layout/                  # Layout components
│   └── seo/                     # SEO components
├── lib/
│   ├── api.ts                   # API client
│   ├── auth.ts                  # Auth utilities
│   ├── constants.ts             # Constants
│   └── utils.ts                 # Utility functions
├── styles/                      # Global styles
└── types/                       # TypeScript types
```

### Backend (`lexluc-backend/`)
```
src/
├── main.ts                      # Application entry
├── app.module.ts                # Root module
├── auth/                        # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   └── guards/
├── services/                    # Services module
│   ├── services.controller.ts
│   └── services.service.ts
├── tours/                       # Tours module
├── bookings/                    # Bookings module
├── blog/                        # Blog posts module
├── contacts/                    # Contact messages module
├── users/                       # Users & roles module
├── media/                       # Media management
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── guards/
├── config/                      # Configuration files
└── prisma/
    ├── schema.prisma            # Database schema
    └── migrations/
```

## 🔐 Authentication & RBAC

### User Roles
1. **Super Admin**: Full system access
2. **Content Manager**: Create/edit services, tours, blog posts
3. **Booking Manager**: View/manage bookings and contact messages
4. **User**: Public booking and inquiry submission

### Implementation
- JWT tokens with role claims
- Role-based guards in backend
- Protected routes in frontend
- Admin dashboard with role-based access

## 📊 Database Schema

### Core Entities
- **User**: Users with roles
- **Role**: Admin roles (Super Admin, Content Manager, Booking Manager)
- **Service**: Company services (Tourism, Agriculture, etc.)
- **Tour**: Specific tour packages
- **Booking**: Tour bookings
- **BlogPost**: Blog articles
- **ContactMessage**: Contact form submissions
- **Media**: Images and files

### Design Principles
- UUID primary keys
- `createdAt` / `updatedAt` timestamps
- Soft deletes for data integrity
- Proper indexing for queries
- Foreign key constraints

## 🔍 SEO & Performance

### Implemented Features
- ✅ Clean, semantic URLs
- ✅ Next.js metadata API
- ✅ OpenGraph tags
- ✅ Twitter Card tags
- ✅ Schema.org structured data (Organization, Service, Tour)
- ✅ XML Sitemap generation
- ✅ robots.txt
- ✅ Image optimization with Next.js Image
- ✅ Font optimization
- ✅ Core Web Vitals optimization

### Monitoring
- Use Vercel Analytics for frontend
- Monitor API performance on Railway/Render
- Database query optimization

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy with `npm run build`

### Backend (Railway/Render)

1. Create project on Railway/Render
2. Connect GitHub repository
3. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Deploy with `npm run build && npm run start`

### Database (Supabase/Neon)

1. Create PostgreSQL database
2. Run migrations: `npx prisma migrate deploy`
3. Update connection string in backend env

## 📝 Environment Variables

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=https://api.lexlucglobal.ng
NEXT_PUBLIC_SITE_URL=https://www.lexlucglobal.ng
```

### Backend `.env`
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://www.lexlucglobal.ng
ENVIRONMENT=production
```

## 🛡 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS protection
- ✅ Rate limiting on API
- ✅ Environment variable validation
- ✅ SQL injection prevention (Prisma)
- ✅ Secure admin routes
- ✅ HTTPS enforcement (production)

## 📞 API Documentation

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration (admin only)
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout

### Services
- `GET /services` - List all services
- `POST /services` - Create service (admin)
- `GET /services/:id` - Get service details
- `PATCH /services/:id` - Update service (admin)
- `DELETE /services/:id` - Delete service (admin)

### Tours
- `GET /tours` - List all tours
- `POST /tours` - Create tour (admin)
- `GET /tours/:id` - Get tour details
- `PATCH /tours/:id` - Update tour (admin)
- `DELETE /tours/:id` - Delete tour (admin)

### Bookings
- `GET /bookings` - List bookings (admin)
- `POST /bookings` - Create booking (public)
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/:id` - Update booking status (admin)

### Blog
- `GET /blog` - List blog posts
- `POST /blog` - Create blog post (admin)
- `GET /blog/:slug` - Get blog post by slug
- `PATCH /blog/:id` - Update blog post (admin)
- `DELETE /blog/:id` - Delete blog post (admin)

### Contacts
- `GET /contacts` - List contact messages (admin)
- `POST /contacts` - Submit contact form (public)
- `PATCH /contacts/:id` - Mark as read (admin)

### Users (Admin)
- `GET /users` - List users (super admin)
- `POST /users` - Create user (super admin)
- `PATCH /users/:id` - Update user (super admin)
- `DELETE /users/:id` - Delete user (super admin)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📄 License

Proprietary © 2025 Lexluc Global Services and Tours Limited

## 📧 Support

For questions or issues, contact: [support@lexlucglobal.ng](mailto:support@lexlucglobal.ng)

---

**Last Updated**: December 24, 2025
