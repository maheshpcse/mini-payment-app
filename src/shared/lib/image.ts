export const AVATAR_OUTPUT_SIZE = 320;
export const AVATAR_MAX_UPLOAD_BYTES = 512 * 1024;
export const AVATAR_MAX_SOURCE_BYTES = 10 * 1024 * 1024;
export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp';

export class ImageProcessingError extends Error {}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageProcessingError('This file could not be read as an image.'));
    };
    image.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Centre-crops to a square and re-encodes at 320×320 in the browser, which
 * keeps uploads small and strips EXIF metadata such as GPS location.
 */
export async function prepareAvatar(file: File): Promise<Blob> {
  if (!AVATAR_ACCEPT.split(',').includes(file.type)) throw new ImageProcessingError('Choose a PNG, JPEG or WebP image.');
  if (file.size > AVATAR_MAX_SOURCE_BYTES) throw new ImageProcessingError('Choose an image smaller than 10 MB.');

  const image = await loadImage(file);
  const side = Math.min(image.naturalWidth, image.naturalHeight);
  if (side < 64) throw new ImageProcessingError('Choose an image at least 64 × 64 pixels.');

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new ImageProcessingError('Your browser could not process this image.');
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);

  for (const [type, quality] of [['image/webp', 0.9], ['image/jpeg', 0.88], ['image/jpeg', 0.7]] as const) {
    const blob = await toBlob(canvas, type, quality);
    // Browsers without WebP encoding fall back to PNG; accept any supported type within budget.
    if (blob && AVATAR_ACCEPT.split(',').includes(blob.type) && blob.size <= AVATAR_MAX_UPLOAD_BYTES) return blob;
  }
  throw new ImageProcessingError('This image is too detailed to upload. Try a different photo.');
}
