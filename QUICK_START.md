# Lexluc Platform - Quick Start Guide

## 🎯 Current Status

✅ **Frontend**: Running on http://localhost:3000 (Turbopack dev server)  
✅ **Backend**: Compiled and ready (but requires PostgreSQL database)  
✅ **Configuration**: Fixed (removed deprecated options, added turbopack root)  
✅ **Packages**: All dependencies installed

## ⚙️ What's Running Now

### Frontend (Next.js 16)
- Status: **ACTIVE** on port 3000
- URL: http://localhost:3000
- Features: Hot reload enabled, Turbopack for fast builds

### Backend (NestJS 10)
- Status: **COMPILED** (no errors)
- Port: 3001 (when database is available)
- Issue: Requires PostgreSQL database connection

## 🚀 Start Backend (Option A: Local PostgreSQL)

If you have PostgreSQL installed locally:

```powershell
cd "C:\Users\User\Desktop\l\lexluc-backend"

# Run Prisma migrations to create tables
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma seed

# Start the backend dev server
npx nest start --watch
```

**Default Database Connection** (from `.env`):
- Host: localhost
- Port: 5432
- User: user
- Password: password
- Database: lexluc_db

## 🚀 Start Backend (Option B: Cloud Database - Recommended)

### Using Supabase (Free, PostgreSQL-compatible)

1. **Create a free Supabase project**:
   - Go to https://supabase.com
   - Sign up and create a new project
   - Wait for provisioning (~2 mins)

2. **Get your database URL**:
   - Go to Project Settings → Database
   - Copy the "Connection String" (URI style)
   - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

3. **Update `.env` file**:
```bash
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
JWT_SECRET="dev-secret-key-change-this"
JWT_EXPIRATION="7d"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
API_PREFIX="api/v1"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"
```

4. **Run migrations and start**:
```powershell
cd "C:\Users\User\Desktop\l\lexluc-backend"

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma seed

# Start dev server
npx nest start --watch
```

### Using Neon (Alternative, Free PostgreSQL)

1. Go to https://neon.tech
2. Sign up and create a database
3. Copy the connection string from the dashboard
4. Follow the same steps as Supabase above

## 🔑 Default Admin Credentials

Once database is set up:
```
Email: admin@lexlucglobal.ng
Password: admin123
```

⚠️ **Change these in production!**

## 📊 Testing the Backend

Once running on port 3001, test the health endpoint:

```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method Get | Select-Object StatusCode, Content

# Or using curl
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T..."
}
```

## 🔗 API Endpoints (After Backend Starts)

### Public Endpoints (No Auth Required)
- `GET  /health` - Health check
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user (admin only)
- `GET  /services` - List all services
- `GET  /tours` - List all tours
- `GET  /blog` - List blog posts
- `POST /contacts` - Submit contact form
- `POST /bookings` - Create booking

### Admin Endpoints (JWT Required, Roles Required)
- `GET  /admin/services` - Manage services
- `GET  /admin/tours` - Manage tours
- `GET  /admin/bookings` - View bookings
- `GET  /admin/blog` - Manage blog
- `GET  /admin/contacts` - View contact messages
- `GET  /admin/users` - Manage users

## 🔧 Environment Files

### Frontend (lexluc-frontend/)
- `.env.local` - Local development (API URL: http://localhost:3001/api/v1)
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Backend (lexluc-backend/)
- `.env` - Development environment (edit this file)
- `.env.example` - Template

## 📝 Troubleshooting

### "Cannot connect to database"
**Solution**: Set up Supabase or local PostgreSQL following Option B above

### "Prisma Client not initialized"
**Solution**: 
```powershell
cd lexluc-backend
npx prisma generate
```

### "Port 3000 already in use"
**Solution**:
```powershell
# Kill node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### "npm script not found"
**Solution**: Use direct commands:
```powershell
# Instead of npm run build, use:
npx nest build

# Instead of npm run start:dev, use:
npx nest start --watch
```

## 🎨 Frontend Files Structure

```
lexluc-frontend/
├── src/
│   ├── app/
│   │   ├── (public)/        # Public pages
│   │   │   ├── page.tsx     # Home
│   │   │   ├── about/
│   │   │   ├── services/
│   │   │   ├── tours/
│   │   │   ├── blog/
│   │   │   ├── contact/
│   │   │   └── ... (other pages)
│   │   └── (auth)/          # Admin pages
│   │       └── admin/
│   │           ├── login/
│   │           └── dashboard/
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   │   ├── api.ts          # API client
│   │   ├── auth.ts         # Auth utilities
│   │   └── constants.ts    # Config
│   └── types/              # TypeScript types
└── public/                 # Static files
```

## 🗄️ Backend Modules

```
lexluc-backend/
├── src/
│   ├── auth/               # Authentication
│   ├── users/              # User management
│   ├── services/           # Company services
│   ├── tours/              # Tour packages
│   ├── bookings/           # Tour bookings
│   ├── blog/               # Blog posts
│   ├── contacts/           # Contact messages
│   ├── prisma/             # Database layer
│   └── common/             # Shared code
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Sample data
└── dist/                   # Compiled output
```

## 📚 API Documentation

After backend starts, full API docs available at:
- http://localhost:3001/api/v1

## ✨ Next Steps

1. ✅ Frontend running
2. ⏳ Set up database (Supabase recommended)
3. ⏳ Start backend
4. ⏳ Test API endpoints
5. ⏳ Connect frontend to backend
6. ⏳ Admin dashboard implementation
7. ⏳ Deployment to production

## 📞 Support

For detailed guides, see:
- `docs/SETUP_GUIDE.md` - Comprehensive setup
- `docs/DEPLOYMENT.md` - Deployment procedures
- `PROJECT_SUMMARY.md` - Project overview
- `lexluc-backend/README.md` - Backend documentation
- `lexluc-frontend/README.md` - Frontend documentation

---

**You're all set! The frontend is running. Set up a database and start the backend to get the full platform running.**
