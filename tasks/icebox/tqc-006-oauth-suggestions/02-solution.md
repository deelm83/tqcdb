# Solution: OAuth Login & Edit Suggestions

## Approach

Use Passport.js for OAuth flows, storing user data in new Prisma models. Suggestions stored as JSON diff records linking users to generals/skills. Admin panel displays suggestions with side-by-side diff view. AI summarization via existing Anthropic integration.

## Libraries

| Library | Purpose | Rationale |
|---------|---------|-----------|
| passport | OAuth middleware | Industry standard, supports all 3 providers |
| passport-google-oauth20 | Google OAuth | Official strategy |
| passport-facebook | Facebook OAuth | Official strategy |
| passport-discord | Discord OAuth | Well-maintained community package |
| express-session | Session management | Required by Passport |
| connect-pg-simple | Session store | PostgreSQL session storage |

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  displayName   String
  email         String?
  avatarUrl     String?
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  oauthAccounts OAuthAccount[]
  suggestions   EditSuggestion[]
}

enum UserRole {
  USER
  ADMIN
}

model OAuthAccount {
  id           String   @id @default(cuid())
  provider     String   // google, facebook, discord
  providerId   String   // ID from provider
  accessToken  String?
  refreshToken String?
  userId       String
  user         User     @relation(fields: [userId], references: [id])

  @@unique([provider, providerId])
}

model EditSuggestion {
  id           String   @id @default(cuid())
  entityType   String   // general, skill
  entityId     String   // general.id or skill.id
  changes      Json     // { field: { old: x, new: y } }
  reason       String?  // optional explanation
  status       SuggestionStatus @default(PENDING)
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  reviewedBy   String?  // admin who reviewed
  reviewedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([entityType, entityId])
  @@index([status])
}

enum SuggestionStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

## Backend Routes

```
/api/auth/
  GET  /google          - Initiate Google OAuth
  GET  /google/callback - Google OAuth callback
  GET  /facebook        - Initiate Facebook OAuth
  GET  /facebook/callback
  GET  /discord         - Initiate Discord OAuth
  GET  /discord/callback
  GET  /me              - Get current user
  POST /logout          - Logout user

/api/suggestions/
  POST /                - Create suggestion (auth required)
  GET  /mine            - List user's suggestions
  GET  /:id             - Get suggestion detail

/api/admin/suggestions/
  GET  /                - List all suggestions (filters: status, entityType)
  GET  /:id             - Get suggestion with entity data
  POST /:id/accept      - Accept and apply changes
  POST /:id/reject      - Reject suggestion
  POST /summarize       - AI summarize multiple suggestions
```

## Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| LoginModal | components/LoginModal.tsx | OAuth provider buttons |
| UserMenu | components/UserMenu.tsx | Avatar dropdown, logout |
| SuggestEditModal | components/SuggestEditModal.tsx | Form for suggesting edits |
| SuggestEditButton | components/SuggestEditButton.tsx | Trigger button on detail pages |
| SuggestionDiff | components/SuggestionDiff.tsx | Side-by-side diff view |

## Data Flow

```
User Login:
  Browser → /api/auth/google → Google OAuth → Callback → Create/Find User → Set Session → Redirect

Submit Suggestion:
  User edits form → POST /api/suggestions → Validate → Store in DB → Return suggestion

Admin Accept:
  Admin clicks Accept → POST /api/admin/suggestions/:id/accept →
  Load suggestion → Apply changes to entity → Update status → Return

AI Summarize:
  Admin selects suggestions → POST /api/admin/suggestions/summarize →
  Fetch all selected → Send to Claude → Return merged suggestion
```

## Image Handling

For image field suggestions:
- User uploads new image via existing dropzone
- Image stored in temp location with suggestion
- On accept, image moved to permanent location
- On reject, temp image deleted after 7 days (cron job)
