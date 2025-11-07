# Firebase Cloud Functions

This directory contains the Firebase Cloud Functions that securely handle AI operations on the server side.

## Setup

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Configure Firebase:**
   - Make sure you have Firebase CLI installed: `npm install -g firebase-tools`
   - Login: `firebase login`
   - Initialize (if not already): `firebase init functions`

3. **Set environment variables:**
   
   For local development, create a `.env` file in the `functions` directory:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ADMIN_EMAIL=your-admin-email@example.com
   ```
   
   For production, set them using Firebase CLI:
   ```bash
   firebase functions:config:set gemini.api_key="your-gemini-api-key"
   firebase functions:config:set admin.email="your-admin-email@example.com"
   ```

## Deployment

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy a specific function:
```bash
firebase deploy --only functions:generateContent
```

## Local Development

Run the Firebase emulator:
```bash
npm run serve
```

This will start the Firebase emulator suite. Make sure to update your client code to connect to the emulator (see `lib/firebase.ts`).

## Functions

### `generateContent`
Generates text content using Gemini AI. Requires admin authentication.

**Request:**
```typescript
{
  prompt: string;
  systemInstruction?: string;
}
```

**Response:**
```typescript
{
  text: string;
}
```

### `generateImageFromPrompt`
Generates an image using Gemini AI. Requires admin authentication.

**Request:**
```typescript
{
  prompt: string;
}
```

**Response:**
```typescript
{
  imageUrl: string; // Base64 data URL
}
```

## Security

- All functions require authentication
- Only users with the admin email can call these functions
- The Gemini API key is stored securely on the server and never exposed to clients

