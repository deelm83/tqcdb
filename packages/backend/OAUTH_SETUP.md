# OAuth Authentication Setup

## Overview

Phase 1 implementation of OAuth login for regular users (separate from admin JWT auth).

## What Was Implemented

### 1. Database Models (Prisma Schema)
- **User**: Stores user information (id, displayName, email, avatarUrl, role)
- **OAuthAccount**: Links users to OAuth providers (Google, Facebook, Discord)
- **EditSuggestion**: Stores user edit suggestions (to be used in Phase 3)
- **Enums**: UserRole (USER, ADMIN), SuggestionStatus (PENDING, ACCEPTED, REJECTED)

### 2. Session Storage
- Created `session` table in PostgreSQL for storing user sessions
- Uses `connect-pg-simple` for PostgreSQL-backed session storage
- Sessions last 30 days

### 3. Passport Configuration
Located in: `src/config/passport.ts`

Implements three OAuth strategies:
- **Google OAuth 2.0**: Uses `passport-google-oauth20`
- **Facebook OAuth**: Uses `passport-facebook`
- **Discord OAuth**: Uses `passport-discord`

Each strategy:
- Finds or creates user account
- Links OAuth account to user
- Updates access/refresh tokens on login
- Stores user info (name, email, avatar)

### 4. Authentication Routes
Located in: `src/routes/userAuth.ts`

All routes prefixed with `/api/user-auth`:
- `GET /google` - Initiate Google OAuth flow
- `GET /google/callback` - Google callback handler
- `GET /facebook` - Initiate Facebook OAuth flow
- `GET /facebook/callback` - Facebook callback handler
- `GET /discord` - Initiate Discord OAuth flow
- `GET /discord/callback` - Discord callback handler
- `GET /me` - Get current logged-in user
- `POST /logout` - Logout user

### 5. Middleware
Located in: `src/middleware/userAuth.ts`

- `requireUser`: Require authenticated user (returns 401 if not logged in)
- `optionalUser`: Attach user if authenticated (doesn't fail if not logged in)

### 6. Express Integration
Updated `src/index.ts`:
- Added express-session middleware with PostgreSQL store
- Added passport initialization
- Registered user auth routes at `/api/user-auth`

## Environment Variables

Add to `.env`:

```env
# Session secret (required)
SESSION_SECRET="your-session-secret-here"

# Backend and frontend URLs
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Facebook OAuth (get from https://developers.facebook.com/)
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""

# Discord OAuth (get from https://discord.com/developers/applications)
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

## Setting Up OAuth Providers

### Google
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3001/api/user-auth/google/callback`
6. Copy Client ID and Client Secret to .env

### Facebook
1. Go to https://developers.facebook.com/
2. Create a new app or select existing
3. Add Facebook Login product
4. Go to Settings → Basic
5. Add OAuth Redirect URI: `http://localhost:3001/api/user-auth/facebook/callback`
6. Copy App ID and App Secret to .env

### Discord
1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URI: `http://localhost:3001/api/user-auth/discord/callback`
5. Copy Client ID and Client Secret to .env

## Testing

### 1. Start the backend
```bash
npm run dev
```

### 2. Test OAuth flow (browser)
Navigate to: `http://localhost:3001/api/user-auth/google`

This will redirect to Google login, then back to frontend with success message.

### 3. Check current user
```bash
curl -X GET http://localhost:3001/api/user-auth/me \
  --cookie "connect.sid=<session-cookie>"
```

### 4. Logout
```bash
curl -X POST http://localhost:3001/api/user-auth/logout \
  --cookie "connect.sid=<session-cookie>"
```

## Important Notes

1. **Separate from Admin Auth**: The existing admin JWT auth (`/api/auth/*`) remains unchanged. This is for regular users only.

2. **Session vs JWT**:
   - Admin auth uses JWT tokens in cookies (`adminToken`)
   - User auth uses Passport sessions (`connect.sid` cookie)

3. **Production Considerations**:
   - Set `NODE_ENV=production` for secure cookies
   - Update OAuth redirect URIs to production domains
   - Use strong SESSION_SECRET and JWT_SECRET
   - Enable HTTPS

4. **Database**:
   - User data stored in `users` table
   - OAuth tokens stored in `oauth_accounts` table
   - Sessions stored in `session` table

## Next Steps (Phase 2)

- Create frontend UserContext for auth state
- Create LoginModal component with OAuth buttons
- Create UserMenu component (avatar dropdown)
- Add login button to header
- Test end-to-end OAuth flow
