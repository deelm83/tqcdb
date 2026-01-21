# Technical Solution

## Approach
Client-side cropping using Canvas API. No backend changes needed.

## Library
`react-easy-crop` (~8KB gzipped)
- Built-in zoom/pan
- Returns crop coordinates
- React 19 compatible

## Components

### 1. imageCrop.ts
Utility functions for Canvas cropping.

```typescript
// Key function
getCroppedImg(imageSrc: string, crop: Area): Promise<Blob>
```

**Location**: `packages/frontend/src/lib/imageCrop.ts`

### 2. ImageCropModal.tsx
Modal component with react-easy-crop.

**Props**:
- `imageSrc: string` - Image to crop
- `onComplete: (blob: Blob) => void` - Callback with cropped image
- `onCancel: () => void` - Close modal

**Features**:
- Fixed 7:10 aspect ratio (locked)
- Zoom slider (1x - 3x)
- Keyboard: Escape = cancel, Enter = confirm

**Location**: `packages/frontend/src/components/ImageCropModal.tsx`

### 3. Integration
Modify existing generals edit page.

**Changes to** `packages/frontend/src/app/admin/generals/[id]/page.tsx`:
- Add state: `cropModalOpen`, `selectedFile`
- File input → opens modal instead of direct upload
- Add "Cắt lại" button next to existing image
- On confirm → call existing `uploadGeneralImage()`

## Data Flow
```
File selected → Modal opens → User crops → Canvas generates Blob → Upload API → Done
```

## Output
- Format: JPEG (quality 0.9)
- Size: 300px width, height auto (7:10 = 428px)
