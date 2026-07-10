# Deployment Guide - Lexluc Global Services Platform

Complete guide for deploying to dev, staging, and production environments.

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENVIRONMENT                  │
├─────────────────────┬─────────────────────┬─────────────────┤
│ Frontend (Vercel)   │ Backend (Railway)    │ Database (Neon) │
│ www.lexluc...       │ api.lexluc...       │ PostgreSQL      │
└─────────────────────┴─────────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     STAGING ENVIRONMENT                     │
├─────────────────────┬─────────────────────┬─────────────────┤
│ Frontend (Vercel)   │ Backend (Railway)    │ Database (Neon) │
│ dev.lexluc...       │ dev-api.lexluc...   │ PostgreSQL      │
└─────────────────────┴─────────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 LOCAL DEVELOPMENT                           │
├─────────────────────┬─────────────────────┬─────────────────┤
│ Frontend            │ Backend             │ Local PostgreSQL│
│ localhost:3000      │ localhost:3001      │ localhost:5432  │
└─────────────────────┴─────────────────────┴─────────────────┘
```

## 📋 Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates ready
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated

## 🌐 Frontend Deployment (Vercel)

### Initial Setup

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Connect Repository**
   - Click "Import Project"
   - Select your GitHub repository
   - Select `lexluc-frontend` directory

3. **Configure Environment**
   
   **Development (dev branch)**
   ```
   NEXT_PUBLIC_API_URL=https://dev-api.lexlucglobal.ng/api/v1
   NEXT_PUBLIC_SITE_URL=https://dev.lexlucglobal.ng
   NEXT_PUBLIC_SITE_NAME=Lexluc Global Services (Dev)
   ```

   **Production (main branch)**
   ```
   NEXT_PUBLIC_API_URL=https://api.lexlucglobal.ng/api/v1
   NEXT_PUBLIC_SITE_URL=https://www.lexlucglobal.ng
   NEXT_PUBLIC_SITE_NAME=Lexluc Global Services
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys

### Continuous Deployment

- Push to `dev` branch → auto-deploys to `dev.lexlucglobal.ng`
- Push to `main` branch → auto-deploys to `www.lexlucglobal.ng`

### Custom Domain

1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records:
   ```
   Name: @
   Type: CNAME
   Value: cname.vercel-dns.com
   ```
4. Vercel auto-configures SSL

## 🔌 Backend Deployment (Railway)

### Initial Setup

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Select your repository

3. **Add Services**

   **PostgreSQL Database**
   - Add `PostgreSQL` service
   - Note the connection string

   **Backend Service**
   - Select `lexluc-backend` directory
   - Set root directory: `lexluc-backend`

4. **Configure Environment Variables**

   ```bash
   DATABASE_URL=<postgres-connection-string>
   JWT_SECRET=<random-secret-key>
   JWT_EXPIRATION=7d
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://www.lexlucglobal.ng
   API_PREFIX=api/v1
   ```

5. **Run Migrations**
   - After first deploy, run migrations:
   ```bash
   railway run npm run prisma:deploy
   ```

6. **Deploy**
   - Railway auto-deploys on push

### Database Backups

```bash
# Enable automatic backups in Railway settings
# Backups stored securely
# Can restore point-in-time
```

## 🗄 Database Deployment (Neon)

### Initial Setup

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up

2. **Create Project**
   - New project
   - Select region closest to your users
   - Choose plan (free for dev, paid for production)

3. **Get Connection String**
   - Copy PostgreSQL connection string
   - Format: `postgresql://user:password@host/database`

4. **Use in Backend**
   ```bash
   # Add to Railway/Render environment variables
   DATABASE_URL=<neon-connection-string>
   ```

### Database Management

```bash
# Connect via Neon CLI
npm install -g neon-cli
neon connection string --database-name lexluc_db

# Or use pgAdmin for GUI management
# psql for command line
psql postgresql://user:password@host/database
```

## 🚀 Step-by-Step Deployment

### 1. Prepare Release

```bash
# Create release branch
git checkout -b release/v1.0.0

# Update version numbers
npm version minor

# Update changelog
echo "## v1.0.0 - December 24, 2025" > CHANGELOG.md

# Commit changes
git add .
git commit -m "chore: prepare release v1.0.0"
```

### 2. Deploy to Staging

```bash
# Push to staging branch
git push origin release/v1.0.0

# Wait for auto-deploy to staging environment
# Test thoroughly on staging

# Check URLs:
# - Frontend: https://dev.lexlucglobal.ng
# - API: https://dev-api.lexlucglobal.ng/health
```

### 3. Validate Staging

```bash
# Test API endpoints
curl https://dev-api.lexlucglobal.ng/api/v1/services

# Test admin login
# Visit https://dev.lexlucglobal.ng/admin/login
# Login with test credentials

# Test key features:
# - Browse website
# - Make booking
# - Submit contact form
# - Login to admin
# - Create/edit content
```

### 4. Deploy to Production

```bash
# Create pull request
git push origin release/v1.0.0

# Code review and approve

# Merge to main
git checkout main
git pull origin main
git merge release/v1.0.0
git push origin main

# Wait for auto-deploy to production
# Monitor logs and errors

# Verify production:
# - Frontend: https://www.lexlucglobal.ng
# - API: https://api.lexlucglobal.ng/api/v1/health
```

### 5. Post-Deployment

```bash
# Tag release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Notify stakeholders
# Monitor error logs
# Check analytics
# Document changes in release notes
```

## 🔄 Rolling Back

### If Issues Occur

```bash
# Revert last deployment in Vercel/Railway
# - Go to Deployments
# - Click "Rollback" on previous version
# - Confirm

# Or revert commits
git revert HEAD
git push origin main
```

## 📊 Monitoring

### Frontend (Vercel)

- **Analytics**: Vercel Dashboard → Analytics
- **Performance**: Vercel Dashboard → Performance
- **Logs**: Vercel Dashboard → Logs

### Backend (Railway)

- **Logs**: Railway Dashboard → Logs
- **Metrics**: Railway Dashboard → Metrics
- **Health**: API `/api/v1/health` endpoint

### Database (Neon)

- **Monitoring**: Neon Console → Monitoring
- **Query Analysis**: Neon Console → Query Insights
- **Backups**: Neon Console → Backups

## 🔐 Security Checklist

- [ ] All environment variables set securely
- [ ] JWT_SECRET is random and long (>32 chars)
- [ ] Database has secure credentials
- [ ] CORS whitelist configured
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting enabled
- [ ] Error details not exposed to users
- [ ] Regular security updates scheduled

## 🚨 Emergency Procedures

### If Database is Down

```bash
# Check status at Neon dashboard
# If issue, restore from backup
# Update DATABASE_URL if needed
# Restart services
```

### If API is Down

```bash
# Check Railway logs
# Restart service
# Or rollback to previous version
# Check database connectivity
```

### If Frontend is Down

```bash
# Check Vercel logs
# Rebuild and redeploy
# Check environment variables
# Check API availability
```

## 📞 Support

- **Issues**: Contact support@lexlucglobal.ng
- **Urgent**: Use emergency hotline
- **Status**: Check status.lexlucglobal.ng

## 📝 Deployment Log Template

```markdown
# Deployment: v1.0.0
**Date**: December 24, 2025  
**Deployed By**: Your Name  
**Environment**: Production  
**Status**: ✅ Successful

## Changes
- Feature 1
- Feature 2
- Bug fix 1

## Testing Performed
- [ ] Frontend tests
- [ ] API tests
- [ ] Database migrations
- [ ] Admin functionality

## Issues/Notes
None

## Rollback Plan
Can rollback to v0.9.9 if needed
```

---

**Last Updated**: December 24, 2025
