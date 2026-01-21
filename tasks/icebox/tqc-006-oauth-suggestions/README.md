# TQC-006: OAuth Login & Community Edit Suggestions

**Status:** approved
**Priority:** high
**Depends:** none

## Overview

Enable user registration via OAuth providers (Google, Facebook, Discord) and allow authenticated users to suggest edits to generals and skills. Admins can review and accept/reject suggestions, with AI summarization for conflicting edits.

## User Flow

1. User clicks "Đăng nhập" and selects OAuth provider
2. User authenticates with provider, account created/linked
3. User browses generals/skills, clicks "Đề xuất chỉnh sửa"
4. User modifies fields and submits suggestion
5. Admin views suggestions in admin panel
6. Admin uses AI to summarize multiple suggestions (if needed)
7. Admin accepts/rejects suggestion, changes applied if accepted

## Task Table

| Task | Type | Estimate |
|------|------|----------|
| Database: users, oauth_accounts, edit_suggestions tables | backend | M |
| OAuth routes for Google/Facebook/Discord | backend | L |
| User session management & middleware | backend | S |
| Suggestion CRUD endpoints | backend | M |
| AI summarization endpoint for suggestions | backend | S |
| Login/signup UI with OAuth buttons | frontend | M |
| User profile dropdown & logout | frontend | S |
| "Suggest Edit" modal on general/skill pages | frontend | L |
| Admin suggestions list page | frontend | M |
| Admin suggestion detail with diff view | frontend | M |
| Accept/reject actions with preview | frontend | S |

**Estimates:** S = Small, M = Medium, L = Large

## Files

- `01-analysis.md` - Requirements & goals
- `02-solution.md` - Technical approach
- `03-ui.md` - UI specifications
- `mockups/` - Interactive HTML mockups
