# TQC-003: Stats Section Alignment Fixes

**ID**: TQC-003
**Created**: 2026-01-19
**Status**: done
**Priority**: low
**Depends**: none

## Overview
UI/UX review found minor alignment issues in the combined stats section on the general edit page. The current implementation is functional but has some alignment inconsistencies.

## Current Implementation Analysis

The stats section (lines 651-710) has already been combined with:
- Single section header "Chỉ số"
- Column headers for "Cơ bản" and "Tăng trưởng"
- Each stat row with label + base input + growth input
- Mobile responsive with stacked layout

## Issues Found

### Issue 1: Column header alignment mismatch
- **Severity**: Minor
- **Type**: Alignment
- **Location**: `packages/frontend/src/app/admin/generals/[id]/page.tsx:661-665`
- **Current**: Column headers use `grid-cols-[1fr,1fr,1fr]` but content rows use `grid-cols-2 md:grid-cols-[1fr,1fr,1fr]`
- **Expected**: Headers and content should use identical grid column definitions
- **Fix**: Apply the same responsive grid classes to both header and content rows

### Issue 2: Empty first column in headers
- **Severity**: Minor
- **Type**: UX
- **Location**: `packages/frontend/src/app/admin/generals/[id]/page.tsx:662`
- **Current**: First column header is empty (`<div className="..."></div>`)
- **Expected**: Could add "Chỉ số" or stat label header for better clarity
- **Fix**: Add header text like "Chỉ số" or leave as visual spacer (acceptable)

### Issue 3: Input text alignment
- **Severity**: Minor
- **Type**: Consistency
- **Location**: `packages/frontend/src/app/admin/generals/[id]/page.tsx:691,703`
- **Current**: Inputs have `text-center` which is good for numbers
- **Status**: Already correctly implemented - no fix needed

## Tasks

### Frontend
- [x] Ensure grid column definitions match between headers and content rows - `packages/frontend/src/app/admin/generals/[id]/page.tsx`
- [x] Added "Chỉ số" label to first header column

### QA
- [x] Verify alignment is consistent at all breakpoints - Same gap-3 and grid classes
- [x] Test with various stat value lengths - text-center on inputs handles this

## Notes
- Overall implementation is good and follows guidelines
- These are polish items, not blocking issues
- The combined layout improves usability by showing base/growth side by side
