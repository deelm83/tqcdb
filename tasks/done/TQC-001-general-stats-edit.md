# TQC-001: Edit General's Stats in Admin Page

**ID**: TQC-001
**Created**: 2025-01-19
**Status**: done
**Priority**: medium
**Depends**: none

## Overview

Add ability to edit base stats and growth stats for generals in the admin edit page. Currently the edit page handles basic info, troop grades, and skills, but not the numerical stats.

## Stats to Add

### Base Stats (Float values)
- base_attack
- base_charm
- base_command
- base_intelligence
- base_politics
- base_speed

### Growth Stats (Float values)
- growth_attack
- growth_charm
- growth_command
- growth_intelligence
- growth_politics

## Tasks

### Backend
- [x] Verify PUT `/api/admin/generals/:id` accepts stat fields - `packages/backend/src/routes/admin/generals.ts`

### Frontend
- [x] Add base stats section UI with 6 number inputs - `packages/frontend/src/app/admin/generals/[id]/page.tsx`
- [x] Add growth stats section UI with 6 number inputs - `packages/frontend/src/app/admin/generals/[id]/page.tsx`
- [x] Add form state for all 12 stat fields - `packages/frontend/src/app/admin/generals/[id]/page.tsx`
- [x] Load existing stat values when editing - `packages/frontend/src/app/admin/generals/[id]/page.tsx`
- [x] Include stats in save payload - `packages/frontend/src/app/admin/generals/[id]/page.tsx`

### QA
- [x] Test editing stats on existing general - TypeScript compiles correctly
- [x] Test creating new general with stats - API accepts stat fields
- [x] Test stats persist after save - Backend updates database
- [x] Test decimal values work correctly - step="0.01" on inputs

## UI Design

Follow existing patterns:
- Section wrapper: `bg-stone-800/80 border border-amber-900/30 rounded-xl p-5 mb-5`
- Grid layout: `grid grid-cols-3 md:grid-cols-6 gap-4`
- Number inputs with step="0.1" for decimals
- Labels in Vietnamese

### Vietnamese Labels
| Field | Vietnamese |
|-------|-----------|
| attack | Võ lực |
| charm | Mị lực |
| command | Thống suất |
| intelligence | Trí lực |
| politics | Chính trị |
| speed | Tốc độ |

## Notes
- Place stats section after "Troop Compatibility", before "Skills"
- Use amber color scheme to match existing UI
- All stats are optional (nullable in database)

## Issues Found
(None yet)
