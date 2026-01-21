# Analysis: OAuth Login & Edit Suggestions

## Problem Statement

Currently only admins can modify data. Community members who notice errors or have improvements cannot contribute. Adding OAuth login enables user identity, and a suggestion system lets users propose changes without direct edit access.

## Goals

- Allow users to sign up/login via Google, Facebook, or Discord
- Enable users to suggest edits to any field on generals/skills (including images)
- Provide admins a dedicated page to review, accept, or reject suggestions
- Support AI summarization when multiple suggestions exist for the same item
- Design user system to be extensible for future features (favorites, comments, etc.)

## Requirements

### Must Have
- OAuth 2.0 login for Google, Facebook, Discord
- User accounts linked to OAuth providers
- Suggest edit form for generals (all fields including images)
- Suggest edit form for skills (all fields including screenshots)
- Admin page listing all pending suggestions
- Accept/reject functionality with changes applied on accept
- Diff view showing original vs proposed changes

### Should Have
- AI summarization button to consolidate multiple suggestions
- User can view their own suggestion history
- Suggestion status tracking (pending, accepted, rejected)
- Prevent duplicate suggestions from same user

### Won't Have (this phase)
- Email/password registration
- User profile editing
- Comments or discussions on suggestions
- Notifications (email or push)

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

## Assumptions

- OAuth provider credentials will be configured in environment variables
- Users accept that suggestions may be rejected
- One suggestion per user per item at a time (can update existing)
- AI summarization uses existing Anthropic SDK integration
