# Deployment Guide

This project uses **Vercel** for frontend and **Railway** for backend + database.

## Prerequisites

- GitHub account with this repo
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project

1. Go to [Railway](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select this repository
4. Choose to deploy from `packages/backend` folder

### 1.2 Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically creates and links `DATABASE_URL` to your backend

### 1.3 Configure Environment Variables

In Railway, go to your backend service → **Variables** tab. Add:

```
NODE_ENV=production
JWT_SECRET=<generate-a-random-string>
SESSION_SECRET=<generate-another-random-string>
ADMIN_PASSWORD=<your-admin-password>
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.railway.app
```

Optional (for AI suggestions):
```
ANTHROPIC_API_KEY=<your-key>
```

Optional (for OAuth):
```
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
FACEBOOK_APP_ID=<your-id>
FACEBOOK_APP_SECRET=<your-secret>
DISCORD_CLIENT_ID=<your-id>
DISCORD_CLIENT_SECRET=<your-secret>
```

### 1.4 Get Railway Deploy Token

1. Go to Railway → Account Settings → Tokens
2. Create a new token named "GitHub Actions"
3. Save this token for GitHub secrets setup

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Import Project

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import this repository
4. Set **Root Directory** to `packages/frontend`
5. Framework preset will auto-detect Next.js

### 2.2 Configure Environment Variables

In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### 2.3 Get Vercel Token

1. Go to Vercel → Account Settings → Tokens
2. Create a new token named "GitHub Actions"
3. Save this token for GitHub secrets setup

---

## Step 3: Configure GitHub Actions

Add these secrets to your GitHub repository:

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value |
|------------|-------|
| `RAILWAY_TOKEN` | Token from Railway (Step 1.4) |
| `VERCEL_TOKEN` | Token from Vercel (Step 2.3) |
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL + /api |

---

## Step 4: Database Migration

After first deployment, run Prisma migrations:

```bash
# In Railway console or local with DATABASE_URL set
npx prisma db push
npx prisma db seed  # Optional: seed initial data
```

---

## CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/ci.yml`) will:

### On Pull Requests:
- ✅ Install dependencies
- ✅ Lint frontend
- ✅ Type-check backend
- ✅ Build both packages

### On Push to Main:
- ✅ All checks above
- ✅ Deploy backend to Railway
- ✅ Deploy frontend to Vercel

---

## Troubleshooting

### Backend not starting
- Check Railway logs for errors
- Verify `DATABASE_URL` is set
- Ensure Prisma client is generated: `npm run db:generate`

### Frontend API errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend match your Vercel URL

### OAuth not working
- Update callback URLs in OAuth provider dashboards:
  - Google: `https://your-backend.railway.app/api/user-auth/google/callback`
  - Facebook: `https://your-backend.railway.app/api/user-auth/facebook/callback`
  - Discord: `https://your-backend.railway.app/api/user-auth/discord/callback`

---

## Local Development

```bash
# Start PostgreSQL
cd packages/backend
docker-compose up -d

# Install dependencies (from root)
npm install

# Start both services
npm run dev
```

Backend: http://localhost:3001
Frontend: http://localhost:3000
