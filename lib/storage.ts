/**
 * Compresses an image file to reduce its size
 * @param file The image file to compress
 * @param maxWidth Maximum width in pixels (default: 1920)
 * @param maxHeight Maximum height in pixels (default: 1080)
 * @param quality Image quality 0-1 (default: 0.8)
 * @returns Compressed image as Blob
 */
const compressImage = (file: File | Blob, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<Blob> => {
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

        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine MIME type
        const mimeType = file instanceof File ? (file.type || 'image/jpeg') : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
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
    // Compress the image to reduce size
    // Target: Keep under 800KB to stay well under Firestore's 1MB limit
    const compressedBlob = await compressImage(file, 1920, 1080, 0.8);
    
    // Check compressed size
    const MAX_COMPRESSED_SIZE = 800 * 1024; // 800KB
    if (compressedBlob.size > MAX_COMPRESSED_SIZE) {
      // Try more aggressive compression
      const moreCompressed = await compressImage(file, 1280, 720, 0.7);
      if (moreCompressed.size > MAX_COMPRESSED_SIZE) {
        // Final attempt with very aggressive compression
        const finalCompressed = await compressImage(file, 960, 540, 0.6);
        return await fileToBase64(finalCompressed);
      }
      return await fileToBase64(moreCompressed);
    }

    return await fileToBase64(compressedBlob);
  } catch (error: any) {
    console.error('Error processing image:', error);
    throw new Error(error?.message || 'Failed to process image. Please try again.');
  }
};

