# Analysis: Image Crop for Generals

## Problem
Currently, admins upload images directly without cropping. This leads to:
- Inconsistent image framing across generals
- Extra work cropping externally before upload
- No way to fix poorly framed existing images

## Goals
1. Consistent profile images (all 7:10 ratio)
2. Faster workflow for admins (crop in-app)
3. Ability to fix existing images without re-uploading

## Users
Admin users managing general profiles in the admin panel.

## Requirements

### Must Have
- [ ] Crop modal when uploading new image
- [ ] Fixed 7:10 aspect ratio (no selection)
- [ ] Drag to reposition crop area
- [ ] Zoom in/out (for tight crops)
- [ ] Preview before confirming
- [ ] Vietnamese UI text

### Should Have
- [ ] Re-crop existing images ("Cắt lại" button)
- [ ] Keyboard shortcuts (Escape, Enter)
- [ ] Loading state during processing

### Won't Have (this version)
- [ ] Multiple aspect ratio options
- [ ] Image filters/adjustments
- [ ] Batch cropping
- [ ] Rotation

## Success Criteria
- [ ] All new uploads go through crop modal
- [ ] Existing images can be re-cropped
- [ ] Output images are 300×428px (7:10)
- [ ] Works in Chrome, Firefox, Safari

## Questions
None - requirements confirmed from previous discussion.

## Assumptions
- 7:10 ratio based on existing image analysis (300×427px common)
- Admins are comfortable with drag/zoom interface
- No need for mobile admin support
