import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      plugins: [
        react(),
        // Copy service worker to dist on build
        {
          name: 'copy-service-worker',
          closeBundle() {
            try {
              copyFileSync('public/sw.js', 'dist/sw.js');
            } catch (error) {
              console.warn('Could not copy service worker:', error);
            }
          },
        },
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(env.REACT_APP_FIREBASE_API_KEY),
        'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.REACT_APP_FIREBASE_AUTH_DOMAIN),
        'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(env.REACT_APP_FIREBASE_PROJECT_ID),
        'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.REACT_APP_FIREBASE_STORAGE_BUCKET),
        'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(env.REACT_APP_FIREBASE_APP_ID),
        'process.env.REACT_APP_ADMIN_EMAIL': JSON.stringify(env.REACT_APP_ADMIN_EMAIL),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Production optimizations - use terser for better minification
        minify: 'terser', // Better minification than esbuild (saves ~1MB)
        cssMinify: 'esbuild', // Minify CSS
        sourcemap: false,
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.logs in production
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'], // Remove console methods
            passes: 3, // Multiple passes for better compression (mobile-optimized)
            unsafe: true, // More aggressive optimizations
            unsafe_comps: true,
            unsafe_math: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
            dead_code: true, // Remove dead code
            unused: true, // Remove unused code
            collapse_vars: true, // Collapse single-use variables
            reduce_vars: true, // Reduce variable usage
          },
          format: {
            comments: false, // Remove all comments
            ascii_only: false, // Allow non-ASCII for smaller size
          },
          mangle: {
            safari10: true, // Fix Safari 10+ issues
            properties: false, // Don't mangle properties (safer for React)
          },
        },
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Aggressive code splitting for mobile optimization
              if (id.includes('node_modules')) {
                // Split React and React DOM separately for better mobile performance
                if (id.includes('react-dom')) {
                  return 'react-dom';
                }
                if (id.includes('react') && !id.includes('react-dom')) {
                  return 'react-core';
                }
                if (id.includes('firebase')) {
                  // Split Firebase into smaller chunks
                  if (id.includes('firestore')) {
                    return 'firebase-firestore';
                  }
                  if (id.includes('auth')) {
                    return 'firebase-auth';
                  }
                  if (id.includes('functions')) {
                    return 'firebase-functions';
                  }
                  return 'firebase-core';
                }
                if (id.includes('react-helmet')) {
                  return 'ui-vendor';
                }
                return 'vendor';
              }
              // Split ALL components for better mobile performance
              if (id.includes('components/')) {
                if (id.includes('CreatePost')) {
                  return 'create-post';
                }
                if (id.includes('ArticleDetail')) {
                  return 'article-detail';
                }
                if (id.includes('ArticleList')) {
                  return 'article-list';
                }
                if (id.includes('Header')) {
                  return 'header';
                }
                if (id.includes('Footer')) {
                  return 'footer';
                }
                return 'components';
              }
              // Split lib files
              if (id.includes('lib/')) {
                if (id.includes('firestore')) {
                  return 'lib-firestore';
                }
                if (id.includes('firebase')) {
                  return 'lib-firebase';
                }
                return 'lib';
              }
            },
            // Aggressive minification
            compact: true,
          },
        },
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
        // Enable tree-shaking
        treeshake: {
          moduleSideEffects: 'no-external',
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        // Target modern browsers for smaller output
        target: 'esnext',
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
        exclude: ['@google/genai'], // Exclude large unused deps
      },
    };
});
