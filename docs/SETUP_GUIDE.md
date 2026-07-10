# Lexluc Global Services - Complete Setup Guide

Welcome to the Lexluc Global Services platform! This guide will help you set up, develop, and deploy the complete system.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Local Development Setup](#local-development-setup)
3. [Running the Application](#running-the-application)
4. [API Documentation](#api-documentation)
5. [Database Management](#database-management)
6. [Deployment Guide](#deployment-guide)
7. [Troubleshooting](#troubleshooting)

## 🏗 Project Overview

This is a complete, production-ready platform for Lexluc Global Services including:

- **Frontend**: Next.js with TypeScript, Tailwind CSS, and SEO optimization
- **Backend**: NestJS REST API with JWT authentication and role-based access
- **Database**: PostgreSQL with Prisma ORM
- **Admin Dashboard**: Secure admin interface for content management

### Tech Stack

**Frontend**
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- Vercel (hosting)

**Backend**
- NestJS 10+
- PostgreSQL 14+
- Prisma 5+
- Railway/Render (hosting)

**Database**
- PostgreSQL
- Supabase/Neon (hosting)

## 🚀 Local Development Setup

### System Requirements

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Git
- npm or yarn

### Step 1: Clone the Repository

```bash
cd ~/projects
git clone <your-repo-url> lexluc-platform
cd lexluc-platform
```

### Step 2: Setup Backend

```bash
cd lexluc-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with local database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/lexluc_db"
# JWT_SECRET="dev-secret-key"
```

### Step 3: Setup Database

```bash
# Create database
createdb lexluc_db

# Run Prisma migrations
npm run prisma:migrate

# Seed sample data
npm run prisma:seed

# Open Prisma Studio to view data
npm run prisma:studio
```

### Step 4: Setup Frontend

```bash
cd ../lexluc-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Verify API URL points to local backend
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 🎯 Running the Application

### Terminal 1: Start Backend API

```bash
cd lexluc-backend
npm run start:dev

# Output: Application is running on: http://localhost:3001/api/v1
```

### Terminal 2: Start Frontend

```bash
cd lexluc-frontend
npm run dev

# Output: Local: http://localhost:3000
```

### Terminal 3 (Optional): Open Database Studio

```bash
cd lexluc-backend
npm run prisma:studio

# Prisma Studio opens at http://localhost:5555
```

### Access the Application

- **Website**: http://localhost:3000
- **API**: http://localhost:3001/api/v1
- **Admin**: http://localhost:3000/admin/login
- **Database**: http://localhost:5555 (Prisma Studio)

### Default Admin Credentials

After seeding, use these to log in:

```
Email: admin@lexlucglobal.ng
Password: admin123
```

⚠️ **IMPORTANT**: Change password after first login in production!

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication

Include JWT token in all admin requests:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example: Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lexlucglobal.ng",
    "password": "admin123"
  }'

# Response:
# {
#   "access_token": "eyJhbGc...",
#   "user": {
#     "id": "uuid",
#     "email": "admin@lexlucglobal.ng",
#     "role": "SUPER_ADMIN"
#   }
# }
```

### Example: Get Services

```bash
curl -X GET http://localhost:3001/api/v1/services

# Response is JSON array of services
```

### Example: Create Service (Admin Only)

```bash
curl -X POST http://localhost:3001/api/v1/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "New Service",
    "slug": "new-service",
    "description": "Service description"
  }'
```

## 🗄 Database Management

### Common Prisma Commands

```bash
# View/edit database
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (development only!)
npm run prisma:reset

# Seed database
npm run prisma:seed

# Generate Prisma client
npx prisma generate
```

### Database Schema

Key tables:
- `users` - System users
- `services` - Company services
- `tours` - Tour packages
- `bookings` - Tour bookings
- `blog_posts` - Blog articles
- `contact_messages` - Contact submissions

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect your GitHub repository
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Production API URL
   - `NEXT_PUBLIC_SITE_URL`: Your domain
5. Deploy

### Backend Deployment (Railway/Render)

**Railway:**

1. Create account at railway.app
2. Create new project
3. Connect GitHub repository
4. Set environment variables:
   - `DATABASE_URL`: Supabase/Neon connection
   - `JWT_SECRET`: Random secret key
   - `CORS_ORIGIN`: Frontend domain
5. Deploy

**Render:**

1. Create account at render.com
2. Create new Web Service
3. Connect GitHub
4. Set build command: `npm run build`
5. Set start command: `npm run start:prod`
6. Add environment variables
7. Deploy

### Database Hosting (Supabase/Neon)

**Supabase:**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string
4. Use as DATABASE_URL in backend

**Neon:**

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy PostgreSQL connection string
4. Use as DATABASE_URL

## 🔧 Troubleshooting

### Frontend Issues

**Port 3000 already in use:**
```bash
# Change port
npm run dev -- -p 3001
```

**API connection errors:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running on correct port
- Check CORS configuration in backend

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Backend Issues

**Port 3001 already in use:**
```bash
# Find and kill process on port 3001
lsof -i :3001
kill -9 <PID>
```

**Database connection error:**
```bash
# Verify DATABASE_URL format
# postgresql://user:password@host:port/database

# Test connection
npx prisma db execute --stdin < <<'EOF'
SELECT 1;
EOF
```

**Migration errors:**
```bash
# Reset database (development only)
npm run prisma:reset

# Or fix specific migration
npx prisma migrate resolve --rolled-back <migration-name>
```

### Common Error Solutions

| Error | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` in correct directory |
| "Port already in use" | Kill process or use different port |
| "Database connection refused" | Verify PostgreSQL is running, check connection string |
| "JWT verification failed" | Ensure JWT_SECRET matches between login and request |
| "CORS error" | Check CORS_ORIGIN in backend matches frontend URL |

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Getting Help

1. Check [Troubleshooting](#troubleshooting) section
2. Review API error messages
3. Check application logs
4. Contact: support@lexlucglobal.ng

## 📝 Notes

- Keep `.env` files secure and never commit them
- Use strong JWT_SECRET in production
- Change default admin password
- Regular database backups recommended
- Monitor API logs in production

---

**Last Updated**: December 24, 2025
