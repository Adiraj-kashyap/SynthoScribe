import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

/**
 * Uploads an image file to Firebase Storage and returns the public URL
 * @param file The image file to upload
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Please check your Firebase configuration.');
  }

  // Check if user is authenticated
  if (!auth || !auth.currentUser) {
    throw new Error('You must be signed in to upload images. Please sign in and try again.');
  }

  try {
    // Create a unique filename using timestamp and original filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `images/${filename}`);

    // Upload the file
    // Firebase SDK automatically includes the auth token when auth.currentUser exists
    await uploadBytes(storageRef, file);

    // Get the public URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading image to Firebase Storage:', error);
    
    // Provide more specific error messages
    if (error?.code === 'storage/unauthorized') {
      throw new Error('You do not have permission to upload images. Please check your authentication status.');
    } else if (error?.code === 'storage/canceled') {
      throw new Error('Upload was canceled. Please try again.');
    } else if (error?.code === 'storage/unknown') {
      throw new Error('An unknown error occurred. This might be a CORS or network issue. Please check your Firebase Storage configuration and security rules.');
    } else if (error?.message?.includes('CORS') || error?.message?.includes('preflight')) {
      throw new Error('CORS error: Please ensure you are signed in and that Firebase Storage security rules allow authenticated uploads.');
    }
    
    throw new Error(error?.message || 'Failed to upload image. Please try again later.');
  }
};

