# TQC-006: OAuth Login & Community Edit Suggestions

**Status**: done
**Priority**: high
**Depends**: none

## Overview
Enable user registration via OAuth providers (Google, Facebook, Discord) and allow authenticated users to suggest edits to generals and skills. Admins can review and accept/reject suggestions, with AI summarization for conflicting edits.

## Tasks

### Phase 1: Database & Auth Setup
- [x] Add Prisma models: User, OAuthAccount, EditSuggestion
- [x] Run migration
- [x] Install passport, passport-google-oauth20, passport-facebook, passport-discord
- [x] Install express-session, connect-pg-simple
- [x] Create OAuth config and strategies
- [x] Create auth routes: /api/auth/google, /api/auth/facebook, /api/auth/discord
- [x] Create /api/auth/me and /api/auth/logout routes
- [x] Add user session middleware

### Phase 2: Frontend Auth
- [x] Create UserContext for auth state
- [x] Create LoginModal component with OAuth buttons
- [x] Create UserMenu component (avatar dropdown, logout)
- [x] Add login button to header
- [x] Test OAuth flow end-to-end

### Phase 3: Suggestion System Backend
- [x] Create POST /api/suggestions - submit suggestion
- [x] Create GET /api/suggestions/mine - user's suggestions
- [x] Create GET /api/admin/suggestions - list all (with filters)
- [x] Create GET /api/admin/suggestions/:id - detail with entity data
- [x] Create POST /api/admin/suggestions/:id/accept - apply changes
- [x] Create POST /api/admin/suggestions/:id/reject
- [x] Create POST /api/admin/suggestions/summarize - AI consolidation

### Phase 4: Suggestion UI
- [x] Create SuggestEditButton component
- [x] Create SuggestEditModal component (form with all fields)
- [x] Add suggest button to general detail page
- [x] Add suggest button to skill detail page
- [x] Handle image field suggestions

### Phase 5: Admin Suggestions Panel
- [x] Create /admin/suggestions page - list view
- [x] Create /admin/suggestions/[id] page - detail with diff
- [x] Implement accept/reject actions
- [x] Add AI summarize button for multiple suggestions
- [x] Add suggestion count badge to admin nav

## Success Criteria
- [ ] User can login with Google, Facebook, or Discord
- [ ] User sees their name/avatar after login
- [ ] User can submit edit suggestion for any general field
- [ ] User can submit edit suggestion for any skill field
- [ ] Admin can view list of pending suggestions
- [ ] Admin can see diff between original and suggested values
- [ ] Admin can accept suggestion and see changes applied
- [ ] Admin can reject suggestion
- [ ] AI summarization works for multiple suggestions on same item

## Reference
Planning docs: `icebox/tqc-006-oauth-suggestions/`
