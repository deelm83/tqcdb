# tqc-004: Image Crop for Generals

**Status**: complete
**Priority**: medium
**Depends**: none

## Overview
Add image cropping for general profile photos. Fixed 7:10 ratio (300×427px). Includes re-crop for existing images.

## Tasks

- [x] Install `react-easy-crop`
- [x] Create `src/lib/imageCrop.ts` - Canvas crop utility
- [x] Create `src/components/ImageCropModal.tsx` - Modal with zoom, 7:10 locked
- [x] Integrate into `src/app/admin/generals/[id]/page.tsx`
- [x] Add "Cắt lại" button for existing images

## Success Criteria
- [x] All new uploads go through crop modal
- [x] Existing images can be re-cropped
- [x] Output images are 300×428px (7:10)

## Reference
Planning docs: `icebox/tqc-004-feature-image-crop/`
