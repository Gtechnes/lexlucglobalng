# Database Setup Options for Lexluc Platform

## ❌ Current Issue

Your Supabase database is unreachable (`db.mpsgrdeqjitpcayqjzmc.supabase.co` DNS failed).

This could be:
- Supabase account suspended
- Database deleted
- Network connectivity issue
- Free tier project paused after 1 week inactivity

---

## ✅ Solution Options (Choose One)

### **OPTION 1: Docker + PostgreSQL (Recommended)**

**Setup Time**: 10 minutes (includes Docker install)

**Steps:**

1. **Download & Install Docker Desktop**:
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Install and restart

2. **Start PostgreSQL container**:
```powershell
docker run --name lexluc-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=lexluc_password_123 `
  -e POSTGRES_DB=lexluc_db `
  -p 5432:5432 `
  -d postgres:16-alpine
```

3. **Update `.env`** with connection string:
```properties
DATABASE_URL="postgresql://postgres:lexluc_password_123@localhost:5432/lexluc_db"
```

4. **Run migrations**:
```powershell
cd "C:\Users\User\Desktop\l\lexluc-backend"
npx prisma migrate dev --name init
npx prisma seed
npx nest start --watch
```

**To stop/remove database later**:
```powershell
docker stop lexluc-postgres
docker rm lexluc-postgres
```

---

### **OPTION 2: Railway.app (Cloud Database)**

**Setup Time**: 5 minutes (no install needed)

**Steps:**

1. **Go to**: https://railway.app
2. **Click**: "Start New Project"
3. **Select**: PostgreSQL
4. **Click**: "Deploy"
5. **Wait**: 1-2 minutes for database to provision
6. **Copy Connection String**:
   - Go to "Connect" tab
   - Copy the "Postgres URI" (starts with `postgresql://`)
7. **Paste into `.env`**:
```bash
DATABASE_URL="[YOUR_RAILWAY_CONNECTION_STRING]"
```
8. **Run migrations**:
```powershell
npx prisma migrate dev --name init
npx prisma seed
npx nest start --watch
```

**Advantages**:
- Zero installation
- Always accessible remotely
- Can deploy backend directly to Railway
- Free tier with 5GB storage

---

### **OPTION 3: Neon (Alternative Cloud)**

**Setup Time**: 5 minutes

**Steps:**

1. **Go to**: https://neon.tech
2. **Sign up with GitHub** (fastest)
3. **Create a project**
4. **Copy connection string** from dashboard
5. **Paste into `.env`**
6. **Run migrations**

**Advantages**:
- Fastest to set up
- Good free tier
- Serverless PostgreSQL
- Auto-scales

---

### **OPTION 4: Local PostgreSQL (If Installed)**

**Setup Time**: 2 minutes

If you have PostgreSQL installed locally:

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE lexluc_db;"

# Update .env
# DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@localhost:5432/lexluc_db"

# Run migrations
cd "C:\Users\User\Desktop\l\lexluc-backend"
npx prisma migrate dev --name init
npx prisma seed
npx nest start --watch
```

---

## 🎯 RECOMMENDED PATH

1. **If you like easy setup**: Use **Railway** (Option 2)
   - Takes 5 minutes
   - No software to install
   - Works from anywhere
   
2. **If you prefer local dev**: Use **Docker** (Option 1)
   - Best for development
   - Database stays on your machine
   - Can deploy later

3. **If you have PostgreSQL**: Use **Option 4**
   - Fastest if already installed

---

## ⚡ Quick Start After DB Setup

Once you have a database connection string, run:

```powershell
# 1. Update .env with your connection string
# (edit c:\Users\User\Desktop\l\lexluc-backend\.env)

# 2. Create database tables
cd "C:\Users\User\Desktop\l\lexluc-backend"
npx prisma migrate dev --name init

# 3. Seed with sample data
npx prisma seed

# 4. Start backend
npx nest start --watch

# 5. In another terminal, start frontend
cd "C:\Users\User\Desktop\l\lexluc-frontend"
npm run dev

# 6. Open http://localhost:3000 in browser
```

---

## 🔍 Testing Database Connection

To test if database is reachable (before migrations):

```powershell
cd "C:\Users\User\Desktop\l\lexluc-backend"
npx prisma db push
```

If you see `Found 0 differences` or the tables are created, your connection works!

---

## ❓ Troubleshooting

**"Can't reach database server"**
- Check connection string in `.env`
- Check firewall allows port 5432
- Ensure PostgreSQL is running

**"Authentication failed"**
- Check username/password in connection string
- Special characters need URL encoding (@ = %40)

**"Database already exists"**
- Run: `npx prisma migrate resolve --applied [migration-name]`
- Or delete and recreate the database

---

## 📝 Your Current `.env`

```properties
DATABASE_URL="postgresql://postgres:ADEyemi.25%40@db.mpsgrdeqjitpcayqjzmc.supabase.co:5432/postgres"
JWT_SECRET="dev-secret-key-change-this"
JWT_EXPIRATION="7d"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
API_PREFIX="api/v1"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"
```

⚠️ **Your Supabase connection is failing**. Choose one of the options above to replace it.

---

## 🚀 Let's Get You Running!

**Which option would you like to use?**

A) Docker + PostgreSQL (local)  
B) Railway (cloud, easiest)  
C) Neon (cloud, fast)  
D) Local PostgreSQL (if you have it)  

Just tell me which one, and I'll walk you through the setup! ✅
