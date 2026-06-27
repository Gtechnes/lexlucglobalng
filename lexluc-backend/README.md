# Lexluc Global Services - Backend API

A production-ready NestJS REST API for Lexluc Global Services and Tours Limited.

## 📋 Features

- ✅ **NestJS Framework** - Enterprise-grade Node.js framework
- ✅ **PostgreSQL** - Robust relational database with Prisma ORM
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Multi-level permission system
- ✅ **Comprehensive API** - RESTful endpoints for all resources
- ✅ **Data Validation** - Input validation with class-validator
- ✅ **Error Handling** - Global exception filtering
- ✅ **Rate Limiting** - API rate limiting for security
- ✅ **CORS** - Cross-origin resource sharing configured

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# DATABASE_URL="postgresql://user:password@localhost:5432/lexluc_db"
# JWT_SECRET="your-secret-key"
```

### Setup Database

```bash
# Run migrations
npm run prisma:migrate

# Seed sample data (optional)
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

### Development

```bash
# Start development server
npm run start:dev

# Server runs on http://localhost:3001/api/v1
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### Auth

- `POST /auth/login` - User login
- `POST /auth/register` - Register user (admin only)
- `GET /auth/me` - Get current user profile

#### Services

- `GET /services` - List all active services
- `GET /services/:id` - Get service by ID
- `GET /services/slug/:slug` - Get service by slug
- `POST /services` - Create service (admin)
- `PATCH /services/:id` - Update service (admin)
- `DELETE /services/:id` - Soft delete service (admin)

#### Tours

- `GET /tours` - List all active tours
- `GET /tours/:id` - Get tour by ID
- `GET /tours/slug/:slug` - Get tour by slug
- `POST /tours` - Create tour (admin)
- `PATCH /tours/:id` - Update tour (admin)
- `DELETE /tours/:id` - Soft delete tour (admin)

#### Bookings

- `POST /bookings` - Create booking (public)
- `GET /bookings` - List all bookings (admin)
- `GET /bookings/:id` - Get booking details (admin)
- `GET /bookings/reference/:referenceNo` - Get booking by reference (public)
- `PATCH /bookings/:id/status?status=CONFIRMED` - Update booking status (admin)
- `DELETE /bookings/:id` - Soft delete booking (admin)

#### Blog

- `GET /blog` - List published blog posts
- `GET /blog/:id` - Get blog post by ID
- `GET /blog/slug/:slug` - Get blog post by slug
- `POST /blog` - Create blog post (admin)
- `PATCH /blog/:id` - Update blog post (admin)
- `DELETE /blog/:id` - Soft delete blog post (admin)

#### Contacts

- `POST /contacts` - Submit contact form (public)
- `GET /contacts` - List contact messages (admin)
- `GET /contacts/:id` - Get contact message (admin)
- `PATCH /contacts/:id/read` - Mark as read (admin)
- `PATCH /contacts/:id/respond` - Send response (admin)
- `DELETE /contacts/:id` - Delete message (admin)

#### Users (Admin)

- `GET /users` - List all users (super admin)
- `POST /users` - Create user (super admin)
- `GET /users/:id` - Get user details (super admin)
- `DELETE /users/:id` - Delete user (super admin)

## 🗄 Database Schema

### Core Models

- **User** - System users with roles
- **Service** - Company services (Tourism, Agriculture, etc.)
- **Tour** - Specific tour packages
- **Booking** - Tour bookings from customers
- **BlogPost** - Blog articles
- **ContactMessage** - Contact form submissions
- **Media** - Images and files
- **CaseStudy** - Case study content
- **QuoteRequest** - Sales quote requests

All models include:

- `id` - UUID primary key
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp
- `deletedAt` - Soft delete timestamp (optional)

## 🔐 User Roles

1. **SUPER_ADMIN** - Full system access
2. **CONTENT_MANAGER** - Manage content (services, tours, blog)
3. **BOOKING_MANAGER** - Manage bookings and messages
4. **USER** - Standard user (bookings, contact)

## 📝 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lexluc_db"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="7d"

# Server
NODE_ENV="development"
PORT=3001

# CORS
CORS_ORIGIN="http://localhost:3000"

# API
API_PREFIX="api/v1"

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"
```

## 🛡 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ Helmet.js for HTTP headers
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)
- ✅ Soft deletes for data recovery

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📦 Deployment

### Railway

1. Create Railway project
2. Connect GitHub repository
3. Set environment variables
4. Deploy with `npm run build && npm run start:prod`

### Render

1. Create Render service
2. Connect GitHub repository
3. Set environment variables
4. Build command: `npm run build`
5. Start command: `npm run start:prod`

### Docker

```bash
# Build image
docker build -t lexluc-backend .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="secret" \
  lexluc-backend
```

## 📚 Project Structure

```
lexluc-backend/
├── src/
│   ├── auth/                    # Authentication module
│   ├── services/                # Services module
│   ├── tours/                   # Tours module
│   ├── bookings/                # Bookings module
│   ├── blog/                    # Blog module
│   ├── contacts/                # Contacts module
│   ├── users/                   # Users module
│   ├── common/                  # Common utilities
│   ├── prisma/                  # Database service
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Database seeding
│   └── migrations/              # Database migrations
├── test/                        # Test files
├── Dockerfile                   # Docker image
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📧 Support

For issues or questions, contact: support@lexlucglobal.ng

## 📄 License

Proprietary © 2025 Lexluc Global Services and Tours Limited

---

**Last Updated**: December 24, 2025
