# Testing Phase 1 Implementation

## Quick Verification

Run this command to verify the OAuth setup:

```bash
npm run db:generate  # Regenerate Prisma client if needed
npx ts-node scripts/test-oauth-setup.ts
```

Expected output:
```
Testing OAuth setup...

1. Checking database tables...
   Found tables: edit_suggestions, oauth_accounts, session, users
   ✅ All required tables exist

2. Testing User model...
   Current user count: 0
   ✅ User model working

3. Testing OAuthAccount model...
   Current OAuth account count: 0
   ✅ OAuthAccount model working

4. Testing EditSuggestion model...
   Current suggestion count: 0
   ✅ EditSuggestion model working

5. Checking environment variables...
   ✅ DATABASE_URL is set
   ✅ JWT_SECRET is set
   ✅ SESSION_SECRET is set
   ✅ All required environment variables are set

6. Checking OAuth provider configurations...
   ⚠️  Google OAuth not configured (optional)
   ⚠️  Facebook OAuth not configured (optional)
   ⚠️  Discord OAuth not configured (optional)

✅ OAuth setup test completed!
```

## Starting the Server

```bash
npm run dev
```

The server should start on port 3001 without errors.

## Available Endpoints

### User OAuth Routes (new)
- `GET /api/user-auth/google` - Start Google OAuth
- `GET /api/user-auth/facebook` - Start Facebook OAuth
- `GET /api/user-auth/discord` - Start Discord OAuth
- `GET /api/user-auth/me` - Get current user
- `POST /api/user-auth/logout` - Logout

### Admin Routes (existing, unchanged)
- `POST /api/auth/login` - Admin login (JWT)
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check admin auth

### Other Routes (unchanged)
- `GET /api/health` - Health check
- `GET /api/generals` - Get generals
- `GET /api/skills` - Get skills

## Testing OAuth Flow (Optional)

To test OAuth, you need to:

1. Set up OAuth credentials in `.env` (see `OAUTH_SETUP.md`)
2. Start the backend: `npm run dev`
3. Navigate to: `http://localhost:3001/api/user-auth/google`
4. Complete OAuth flow
5. Check user created in database

## Troubleshooting

### "Session table missing" error
Run:
```bash
npx ts-node scripts/create-session-table.ts
```

### TypeScript errors
Run:
```bash
npm run db:generate
npx tsc --noEmit
```

### Port already in use
Kill existing backend:
```bash
pkill -f "ts-node src/index.ts"
```

## Next Steps

Phase 1 is complete. Next is Phase 2: Frontend Auth UI.
