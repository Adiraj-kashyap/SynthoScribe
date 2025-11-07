/**
 * Compresses an image file to reduce its size
 * Uses WebP format for better compression when supported, falls back to JPEG
 * @param file The image file to compress
 * @param maxWidth Maximum width in pixels (default: 1920)
 * @param maxHeight Maximum height in pixels (default: 1080)
 * @param quality Image quality 0-1 (default: 0.8)
 * @param useWebP Whether to use WebP format (default: true)
 * @returns Compressed image as Blob
 */
const compressImage = (
  file: File | Blob, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8,
  useWebP: boolean = true
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image rendering quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try WebP first (better compression), fallback to JPEG
        const mimeType = useWebP ? 'image/webp' : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else if (useWebP) {
              // Fallback to JPEG if WebP fails
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    resolve(jpegBlob);
                  } else {
                    reject(new Error('Failed to compress image'));
                  }
                },
                'image/jpeg',
                quality
              );
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a file or blob to base64 data URL
 * @param file The file or blob to convert
 * @returns Base64 data URL string
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to convert file to base64'));
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image file and returns it as a base64 data URL
 * Images are automatically compressed to keep them under Firestore's 1MB document limit
 * Uses WebP format for optimal compression when supported
 * 
 * This solution is completely FREE - no paid Firebase Storage plan required!
 * Images are stored directly in Firestore as base64 data URLs.
 * 
 * @param file The image file to upload
 * @returns The base64 data URL of the image (can be used directly in img src)
 */
export const uploadImage = async (file: File): Promise<string> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  // Validate file size (max 10MB before compression)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size must be less than 10MB. Large images will be automatically compressed.');
  }

  try {
    // Progressive compression strategy:
    // 1. Start with reasonable quality WebP (1200x800, quality 0.75)
    // 2. If still too large, reduce dimensions and quality
    // 3. Final fallback: very aggressive compression
    
    const TARGET_SIZE = 400 * 1024; // Target: 400KB (well under 1MB limit, accounting for base64 overhead)
    const MAX_COMPRESSED_SIZE = 600 * 1024; // Hard limit: 600KB
    
    // Attempt 1: WebP at 1200x800, quality 0.75
    let compressedBlob = await compressImage(file, 1200, 800, 0.75, true);
    
    if (compressedBlob.size > MAX_COMPRESSED_SIZE) {
      // Attempt 2: WebP at 960x640, quality 0.65
      compressedBlob = await compressImage(file, 960, 640, 0.65, true);
      
      if (compressedBlob.size > MAX_COMPRESSED_SIZE) {
        // Attempt 3: WebP at 800x600, quality 0.55
        compressedBlob = await compressImage(file, 800, 600, 0.55, true);
        
        if (compressedBlob.size > MAX_COMPRESSED_SIZE) {
          // Attempt 4: WebP at 640x480, quality 0.5 (very aggressive)
          compressedBlob = await compressImage(file, 640, 480, 0.5, true);
          
          if (compressedBlob.size > MAX_COMPRESSED_SIZE) {
            // Final attempt: JPEG at 640x480, quality 0.4 (most aggressive)
            compressedBlob = await compressImage(file, 640, 480, 0.4, false);
          }
        }
      }
    }

    // Convert to base64
    const base64Url = await fileToBase64(compressedBlob);
    
    // Log compression stats for debugging
    const originalSizeKB = (file.size / 1024).toFixed(2);
    const compressedSizeKB = (compressedBlob.size / 1024).toFixed(2);
    const base64SizeKB = ((base64Url.length * 3) / 4 / 1024).toFixed(2);
    const compressionRatio = ((1 - compressedBlob.size / file.size) * 100).toFixed(1);
    
    console.log(`Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction), Base64: ${base64SizeKB}KB`);
    
    return base64Url;
  } catch (error: any) {
    console.error('Error processing image:', error);
    throw new Error(error?.message || 'Failed to process image. Please try again.');
  }
};

