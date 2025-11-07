<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Content Platform MVP

A modern, secure content platform powered by AI with Firebase backend, authentication, and admin features.

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, Firebase account

1. **Install dependencies:**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local` (create if it doesn't exist)
   - Add your Firebase configuration and admin email
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup

3. **Deploy Firebase Cloud Functions:**
   ```bash
   cd functions
   firebase deploy --only functions
   cd ..
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

## ✨ Features

### Security & Admin
- ✅ **Secure AI Functions** - Gemini API key protected in Firebase Cloud Functions
- ✅ **User Authentication** - Google Sign-in with Firebase Auth
- ✅ **Admin Controls** - Create, edit, and delete posts (admin only)
- ✅ **Secure Cloud Functions** - Admin-only access to AI features

### Content Management
- ✅ **AI-Powered Content** - Generate articles and images with Gemini AI
- ✅ **Image Upload** - Upload custom images (stored as base64 in Firestore - completely FREE!)
- ✅ **Edit & Delete** - Full CRUD operations for articles

### User Experience
- ✅ **SEO Optimized** - Dynamic meta tags for each article
- ✅ **Social Sharing** - Open Graph and Twitter Card support
- ✅ **AdSense Integration** - Real Google AdSense ads (configurable)
- ✅ **Comments** - User comments with auto-filled author names

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment and security guide
- [functions/README.md](functions/README.md) - Cloud Functions setup and deployment

## 🔒 Security Notes

**IMPORTANT:** The Gemini API key is now secured in Firebase Cloud Functions and never exposed to clients. The old client-side `lib/gemini.ts` has been replaced with secure Cloud Function calls.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Firebase (Firestore, Functions, Auth) - **100% Free Tier Compatible!**
- **Image Storage:** Base64 in Firestore (no paid storage required)
- **AI:** Google Gemini (via Cloud Functions)
- **SEO:** react-helmet-async
- **Ads:** Google AdSense

## 💰 Free Tier Friendly

This project is designed to work entirely on Firebase's free tier:
- ✅ **Firestore** - Free tier: 1GB storage, 50K reads/day, 20K writes/day
- ✅ **Cloud Functions** - Free tier: 2M invocations/month
- ✅ **Authentication** - Free tier: Unlimited
- ✅ **Image Storage** - Images stored as base64 in Firestore (automatically compressed)
- ❌ **No Firebase Storage required** - Saves you from needing the Blaze plan!

## 📝 Environment Variables

See [DEPLOYMENT.md](DEPLOYMENT.md) for a complete list of required environment variables.
