<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SynthoScribe - AI Content Platform MVP

A modern, secure, and cost-effective content platform powered by Google Gemini AI. Built with React, Firebase, and designed to work entirely on free tier services.

## 🎯 Project Goals

SynthoScribe is designed as a **Phase 1 MVP** for a scalable, AI-driven content platform. The primary goals are:

- **Cost-Effective**: Operate entirely on Firebase's free tier - no paid plans required
- **AI-Powered**: Leverage Google Gemini AI for content and image generation
- **Secure**: Protect API keys and sensitive operations through Firebase Cloud Functions
- **Scalable Foundation**: Built with Headless/Jamstack architecture for future expansion
- **User-Friendly**: Modern UI with Google authentication and seamless content creation

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React Context API for authentication
- **SEO**: react-helmet-async for dynamic meta tags

### Backend (Firebase)
- **Database**: Firestore (NoSQL) for articles and comments
- **Authentication**: Firebase Auth with Google Sign-in
- **Functions**: Cloud Functions for secure AI operations
- **Storage**: Base64 images stored directly in Firestore (no Storage bucket needed!)

### AI Integration
- **Provider**: Google Gemini AI
- **Models Used**:
  - `gemini-2.5-flash` for text generation
  - `gemini-2.5-flash-image` for image generation
- **Security**: All AI operations run server-side via Cloud Functions

## ✨ Features

### 🤖 AI-Powered Content Creation
- **Article Drafting**: Generate complete blog posts from a title using AI
- **Title Brainstorming**: Get AI-suggested titles based on your content
- **Image Generation**: Create featured images from article titles
- **Content Summarization**: Generate AI summaries of articles (public feature)

### 📝 Content Management
- **Create Articles**: Rich HTML content editor with AI assistance
- **Edit Articles**: Update existing articles while preserving author information
- **Delete Articles**: Admin-only article deletion
- **Image Upload**: Upload custom images (automatically compressed and stored as base64)
- **Real-time Updates**: Articles sync in real-time across all clients

### 👤 User Features
- **Google Authentication**: Sign in with your Google account
- **Profile Integration**: Articles and comments automatically use your Google name and profile picture
- **Comments System**: Leave comments with your Google account info
- **Dark Mode**: Toggle between light and dark themes

### 🔒 Security & Admin
- **Admin-Only Features**: Only designated admin email can create/edit/delete articles
- **Secure API Keys**: Gemini API key never exposed to clients
- **Authenticated Operations**: All AI features require authentication
- **Author Preservation**: Editing articles preserves original author information

### 🎨 User Experience
- **SEO Optimized**: Dynamic meta tags for each article
- **Social Sharing**: Open Graph and Twitter Card support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Search Functionality**: Search articles by title and content
- **Reading Time**: Automatically calculated reading time for articles

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase account (free tier is sufficient)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SynthoScribe
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install Cloud Functions dependencies
   cd functions
   npm install
   cd ..
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration (get from Firebase Console > Project Settings)
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   
   # Admin Configuration
   REACT_APP_ADMIN_EMAIL=your-admin-email@example.com
   
   # Gemini API Key (for Cloud Functions)
   GEMINI_API_KEY=your-gemini-api-key
   ```

   Create a `.env` file in the `functions` directory:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   ADMIN_EMAIL=your-admin-email@example.com
   ```

4. **Set up Firebase**
   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase (if not already done)
   firebase init
   ```

5. **Deploy Cloud Functions**
   ```bash
   cd functions
   firebase deploy --only functions
   cd ..
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📖 How It Works

### Content Creation Flow

1. **Sign In**: User signs in with Google account
2. **Create Article**: Click "Create Post" button (admin only)
3. **AI Assistance**:
   - Enter a title and click "Draft with AI" to generate content
   - Or write content manually
   - Use "Brainstorm Titles" to get AI-suggested titles
4. **Add Image**:
   - Upload a custom image (automatically compressed)
   - Or generate an AI image from the title
5. **Publish**: Article is saved to Firestore with your Google account info

### Image Storage Strategy

Instead of using Firebase Storage (which requires a paid plan), images are:
1. **Compressed client-side** using Canvas API
2. **Converted to base64** data URLs
3. **Stored directly in Firestore** documents
4. **Automatically optimized** to stay under Firestore's 1MB document limit

This approach is:
- ✅ **100% Free** - No paid storage required
- ✅ **No CORS Issues** - Everything happens client-side
- ✅ **Automatic Compression** - Large images are optimized automatically

### Authentication & Authorization

- **Google Sign-In**: Users authenticate via Firebase Auth
- **Admin Detection**: System checks if user's email matches `REACT_APP_ADMIN_EMAIL`
- **Author Attribution**: Articles use Google account name and profile picture
- **Auto-Migration**: Old articles with "AI Contributor" are automatically updated to use your account info

### AI Operations

All AI operations are secured through Firebase Cloud Functions:

1. **Client Request**: Frontend calls Cloud Function with prompt
2. **Authentication Check**: Function verifies user is authenticated and is admin
3. **AI Processing**: Gemini API is called server-side
4. **Response**: Generated content/image is returned to client

This ensures:
- API keys never leave the server
- Rate limiting and security controls
- Cost tracking and monitoring

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **react-helmet-async** - Dynamic SEO meta tags

### Backend
- **Firebase Firestore** - NoSQL database
- **Firebase Auth** - Authentication service
- **Firebase Cloud Functions** - Serverless functions
- **Google Gemini AI** - Content and image generation

### Development Tools
- **Vite** - Build tool
- **TypeScript** - Type checking
- **ESLint** - Code linting (if configured)

## 💰 Free Tier Compatibility

This project is designed to work entirely on Firebase's **Spark (Free) Plan**:

| Service | Free Tier Limits | Usage in Project |
|---------|-----------------|------------------|
| **Firestore** | 1GB storage, 50K reads/day, 20K writes/day | Articles, comments, images (base64) |
| **Cloud Functions** | 2M invocations/month | AI content/image generation |
| **Authentication** | Unlimited | Google Sign-in |
| **Storage** | ❌ Not used | Images stored in Firestore instead |

### Cost Optimization Strategies

1. **No Firebase Storage**: Images stored as base64 in Firestore
2. **Client-Side Compression**: Reduces storage and bandwidth
3. **Efficient Queries**: Optimized Firestore queries
4. **Cached AI Responses**: (Future enhancement)

## 🔒 Security Features

### API Key Protection
- Gemini API key stored only in Cloud Functions
- Never exposed to client-side code
- Environment variables for configuration

### Authentication
- Google OAuth for secure sign-in
- Admin-only access to content creation
- User identity verified on every AI operation

### Data Security
- Firestore security rules (should be configured)
- Server-side validation of all operations
- Author information preserved on edits

## 📁 Project Structure

```
SynthoScribe/
├── components/          # React components
│   ├── ArticleCard.tsx
│   ├── ArticleDetail.tsx
│   ├── ArticleList.tsx
│   ├── CreatePost.tsx
│   ├── CommentForm.tsx
│   └── ...
├── lib/                # Core libraries
│   ├── firebase.ts     # Firebase initialization
│   ├── firestore.ts    # Database operations
│   ├── functions.ts    # Cloud Functions client
│   ├── storage.ts      # Image upload/compression
│   └── auth.tsx        # Authentication context
├── functions/          # Cloud Functions
│   ├── src/
│   │   └── index.ts    # AI functions
│   └── package.json
├── types.ts            # TypeScript interfaces
├── constants.ts       # App constants
├── App.tsx            # Main app component
└── vite.config.ts     # Vite configuration
```

## 🎨 Key Features Explained

### AI Content Generation
- **Draft with AI**: Generates complete blog posts from titles
- **Brainstorm Titles**: Suggests multiple title options
- **Generate Image**: Creates featured images using Gemini's image model
- **Summarize**: Public feature to generate article summaries

### Image Handling
- **Upload**: Drag-and-drop or click to upload
- **Compression**: Automatic multi-stage compression (1920px → 1280px → 960px)
- **Format**: Converts to base64 for Firestore storage
- **Size Limit**: Maximum 10MB before compression, optimized to <800KB

### Author Management
- **Auto-Detection**: Uses Google account name and photo
- **Migration**: Old articles automatically updated on sign-in
- **Preservation**: Author info preserved when editing articles
- **Fallback**: Generated avatars for users without profile pictures

## 🚧 Future Enhancements

Potential improvements for future phases:

- [ ] Multi-author support with user roles
- [ ] Advanced AI features (RAG, fine-tuning)
- [ ] Content scheduling and publishing workflow
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Content versioning
- [ ] Media library management
- [ ] Export/import functionality

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [functions/README.md](functions/README.md) - Cloud Functions documentation

## 🤝 Contributing

This is a Phase 1 MVP. Contributions and suggestions are welcome!

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- Google Gemini AI for content generation
- Firebase for backend infrastructure
- React and Vite communities

---

**Built with ❤️ using React, Firebase, and Google Gemini AI**
