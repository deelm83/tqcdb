import { Area } from 'react-easy-crop';

/**
 * Creates an image element from a URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

/**
 * Crops an image using Canvas API
 * @param imageSrc - Source image URL or data URL
 * @param crop - Crop area from react-easy-crop
 * @param outputWidth - Output width in pixels (default 300)
 * @returns Cropped image as Blob
 */
export async function getCroppedImg(
  imageSrc: string,
  crop: Area,
  outputWidth: number = 300
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Calculate output height based on 7:10 ratio
  const outputHeight = Math.round(outputWidth * (10 / 7));

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

/**
 * Creates an object URL from a File
 */
export function createImageUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes an object URL to free memory
 */
export function revokeImageUrl(url: string): void {
  URL.revokeObjectURL(url);
}
