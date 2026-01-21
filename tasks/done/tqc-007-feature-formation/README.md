# TQC-007: Formation (Đội Hình) Feature

## Status: DONE

## Summary
Add a Formation/Team Builder feature that allows users to create, share, and rank team compositions. This includes a Line-up system for managing multiple formations with conflict detection.

## Key Features
1. **Formation Builder** - Create teams with up to 3 generals, max 21 cost, army type selection
2. **Skill Assignment** - Assign 2 extra skills per general beyond their innate skills
3. **Community Rankings** - Admin-created formations can be ranked by users
4. **Formation Sharing** - Capture formation as image, share publicly
5. **Line-up System** - Manage multiple formations with general/skill conflict detection

## User Stories
- As a visitor, I can view community formations ranked by popularity
- As a visitor, I can create a formation and export it as an image
- As a user, I can save formations to my account and edit them later
- As a user, I can share formations publicly and copy others' formations
- As a user, I can create line-ups with multiple formations
- As an admin, I can create curated formations for community ranking

## Documents
- [01-analysis.md](./01-analysis.md) - Requirements analysis
- [02-solution.md](./02-solution.md) - Technical solution
- [03-ui.md](./03-ui.md) - UI/UX design

## Dependencies
- TQC-006: OAuth Login (for user accounts)
- Existing generals and skills data

## Estimation
- Phase 1: Database & API (Formation CRUD)
- Phase 2: Formation Builder UI
- Phase 3: Sharing & Export
- Phase 4: Rankings System
- Phase 5: Line-up System with Conflict Detection
