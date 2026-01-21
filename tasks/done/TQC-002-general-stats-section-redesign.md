# TQC-002: General Stats Section Redesign

**ID**: TQC-002
**Created**: 2026-01-19
**Status**: done
**Priority**: medium
**Depends**: none

## Overview
Combine the "Base Stats" and "Growth Stats" sections into a single unified section on the general edit page. Display base and growth values next to each other for each stat type.

## Current Structure
Currently there are two separate sections:
1. **Section 5 - "Chỉ số cơ bản"** (Base Stats) - Lines 651-682
   - 6 stats in a grid (Võ lực, Thống suất, Trí lực, Chính trị, Mị lực, Tốc độ)
   - Each stat has its own input field

2. **Section 6 - "Chỉ số tăng trưởng"** (Growth Stats) - Lines 684-715
   - Same 6 stats in same layout
   - Separate input fields for growth values

## Proposed Design
Combine into a single section with this layout:

```
┌─────────────────────────────────────────────────────────────────┐
│ Chỉ số                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stat Name          Base           Growth                       │
│  ────────────────────────────────────────────                   │
│  ⚔️ Võ lực          [______]       [______]                     │
│  🎖️ Thống suất      [______]       [______]                     │
│  🧠 Trí lực         [______]       [______]                     │
│  📜 Chính trị       [______]       [______]                     │
│  ✨ Mị lực          [______]       [______]                     │
│  🏃 Tốc độ          [______]       [______]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Layout options:
- **Table layout**: Clean rows with stat name, base input, growth input
- **Grid layout**: 3 columns per row, each with label + base + growth

## Tasks

### Frontend
- [x] Remove separate "Chỉ số cơ bản" section (lines 651-682) - `packages/frontend/src/app/admin/generals/[id]/page.tsx`
- [x] Remove separate "Chỉ số tăng trưởng" section (lines 684-715) - `packages/frontend/src/app/admin/generals/[id]/page.tsx`
- [x] Create new combined "Chỉ số" section with:
  - Single section header with stats icon
  - Table/grid layout with stat name, base input, and growth input per row
  - Column headers for "Cơ bản" and "Tăng trưởng"
  - Responsive design (stack on mobile if needed)

### QA
- [x] Verify all 6 stats display correctly with base and growth inputs
- [x] Test form submission still saves all values - Same form fields, no changes to save logic
- [x] Test responsive layout on mobile devices - Mobile labels show inline
- [x] Verify visual consistency with rest of page - Same styling patterns used

## Notes
- Keep the same form field names (baseAttack, growthAttack, etc.)
- Keep the same icons for each stat type
- Section should maintain the same dark theme styling as other sections
- Consider adding column headers "Cơ bản" and "Tăng trưởng" above input columns
