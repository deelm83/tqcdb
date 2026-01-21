# tqc-004: Image Crop for Generals

**Status**: approved
**Priority**: medium
**Depends**: none

## Overview
Add image cropping for general profile photos. Users can crop when uploading new images or re-crop existing ones. Fixed 7:10 portrait ratio to match existing images (300×427px).

## User Flow
1. Admin clicks "Tải ảnh" or "Cắt lại" on general edit page
2. Crop modal opens with image
3. Admin adjusts crop area (drag + zoom)
4. Admin clicks "Cắt ảnh" to confirm
5. Cropped image uploads to server

## Tasks

| Task | Type | Estimate |
|------|------|----------|
| Install react-easy-crop | setup | XS |
| Create imageCrop.ts utility | frontend | S |
| Create ImageCropModal component | frontend | M |
| Integrate into generals edit page | frontend | S |
| Add re-crop for existing images | frontend | S |

**Total**: ~6-8 hours

## Files
- `01-analysis.md` - Requirements & goals (review this first)
- `02-solution.md` - Technical approach
- `03-ui.md` - UI specifications
- `mockups/crop-modal.html` - Interactive mockup
