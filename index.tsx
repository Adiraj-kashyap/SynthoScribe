import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './lib/auth';
import './index.css';

// Code splitting - lazy load main app (mobile-optimized)
const App = React.lazy(() => import('./App'));

// Defer service worker registration to reduce initial JS execution time
// Register after initial render to avoid blocking
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Silent registration - no console logs in production
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  // Service worker updated
                }
              });
            }
          });
        })
        .catch(() => {
          // Silent failure
        });
    }, { timeout: 3000 });
  } else {
    setTimeout(() => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {});
    }, 2000);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
