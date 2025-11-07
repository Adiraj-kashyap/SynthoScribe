import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from './firebase';

// Cloud Functions wrapper for AI operations
// These functions will be deployed to Firebase Cloud Functions
// and will securely handle the Gemini API key on the server side

interface GenerateContentRequest {
  prompt: string;
  systemInstruction?: string;
  isPublic?: boolean; // For public operations like summarize
}

interface GenerateImageRequest {
  prompt: string;
}

interface GenerateContentResponse {
  text: string;
}

interface GenerateImageResponse {
  imageUrl: string;
}

/**
 * Calls the generateContent function
 * For public operations (like summarize): Uses client-side Gemini API (works on free tier)
 * For admin operations: Tries Cloud Functions first, falls back to client-side if not available
 * @param isPublic - Set to true for public operations (like summarize) that don't require auth
 */
export async function generateContent(
  prompt: string,
  systemInstruction?: string,
  isPublic: boolean = false
): Promise<string> {
  // For public operations (like summarize), use client-side API directly
  // This works on Firebase free tier and doesn't expose admin API keys
  if (isPublic) {
    try {
      // Import client-side Gemini function
      const { generateContent: clientGenerateContent } = await import('./gemini');
      return await clientGenerateContent(prompt, systemInstruction);
    } catch (error) {
      console.error('Error with client-side Gemini API:', error);
      throw new Error('Failed to generate summary. Please check your GEMINI_API_KEY in .env.local');
    }
  }

  // For admin operations, try Cloud Functions first (if available)
  if (functions) {
    try {
      const generateContentFunction = httpsCallable<GenerateContentRequest, GenerateContentResponse>(
        functions,
        'generateContent'
      );
      
      const result: HttpsCallableResult<GenerateContentResponse> = await generateContentFunction({
        prompt,
        systemInstruction,
        isPublic: false,
      });

      if (result.data.text) {
        return result.data.text;
      }
    } catch (error: any) {
      // If Cloud Functions fail (e.g., not deployed, free tier, etc.), fall back to client-side
      console.warn('Cloud Functions not available, falling back to client-side:', error);
      
      // Fall through to client-side for admin operations too (graceful degradation)
      try {
        const { generateContent: clientGenerateContent } = await import('./gemini');
        return await clientGenerateContent(prompt, systemInstruction);
      } catch (clientError) {
        // Provide helpful error messages
        if (error?.code === 'functions/unauthenticated') {
          throw new Error('You must be logged in to use this feature.');
        } else if (error?.code === 'functions/permission-denied') {
          throw new Error('You do not have permission to use this feature.');
        }
        throw new Error('Failed to generate content. Please check your configuration.');
      }
    }
  }

  // Fallback to client-side if functions not available
  try {
    const { generateContent: clientGenerateContent } = await import('./gemini');
    return await clientGenerateContent(prompt, systemInstruction);
  } catch (error) {
    throw new Error('AI service is not available. Please check your GEMINI_API_KEY configuration.');
  }
}

/**
 * Calls the generateImageFromPrompt function
 * Tries Cloud Functions first, falls back to client-side if not available (for free tier)
 */
export async function generateImageFromPrompt(prompt: string): Promise<string> {
  // Try Cloud Functions first (if available)
  if (functions) {
    try {
      const generateImageFunction = httpsCallable<GenerateImageRequest, GenerateImageResponse>(
        functions,
        'generateImageFromPrompt'
      );
      
      const result: HttpsCallableResult<GenerateImageResponse> = await generateImageFunction({
        prompt,
      });

      if (result.data.imageUrl) {
        return result.data.imageUrl;
      }
    } catch (error) {
      // Fall back to client-side if Cloud Functions fail
      console.warn('Cloud Functions not available, falling back to client-side:', error);
    }
  }

  // Fallback to client-side (works on free tier)
  try {
    const { generateImageFromPrompt: clientGenerateImage } = await import('./gemini');
    return await clientGenerateImage(prompt);
  } catch (error) {
    throw new Error('Failed to generate image. Please check your GEMINI_API_KEY configuration.');
  }
}

