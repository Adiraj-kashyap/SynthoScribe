import React, { useState, useEffect, Suspense } from 'react';
import { Article } from './types';
import { db } from './lib/firebase';
import { addArticle, updateArticle, seedInitialArticles, migrateOldArticles } from './lib/firestore';
import { useAuth } from './lib/auth';
import ArticleListSkeleton from './components/ArticleListSkeleton';
import Toast from './components/Toast';
import SEO from './components/SEO';

// Lazy load ALL components to reduce initial JS execution time (mobile-optimized)
const Header = React.lazy(() => import('./components/Header'));
const Footer = React.lazy(() => import('./components/Footer'));
const ArticleList = React.lazy(() => import('./components/ArticleList'));
const ArticleDetail = React.lazy(() => import('./components/ArticleDetail'));
const CreatePost = React.lazy(() => import('./components/CreatePost'));

// Dynamic import for Firestore to defer execution
const loadFirestore = () => import('firebase/firestore');

type View = 'list' | 'detail' | 'create';
type ToastMessage = { id: number; message: string; type: 'success' | 'error' };

const App: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<View>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Defer Firestore initialization to reduce critical path latency (mobile-optimized)
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Use requestIdleCallback or setTimeout to defer non-critical work
    const loadArticles = async () => {
      // Defer seed operation (non-critical) - use idle time
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          seedInitialArticles();
        }, { timeout: 5000 });
      } else {
        setTimeout(() => {
          seedInitialArticles();
        }, 2000);
      }

      // Dynamically import Firestore to defer execution (reduces initial JS execution)
      const firestore = await loadFirestore();
      const { collection, query, getDocs, onSnapshot, orderBy } = firestore;

      const database = await db(); // Call the async getter function
      if (!database) {
        if (mounted) {
          setIsLoading(false);
          showToast("Could not connect to the database.", "error");
        }
        return;
      }

      try {
        const articlesCol = collection(database, 'articles');
        const q = query(articlesCol, orderBy('publishDate', 'desc'));

        // First, do a one-time fetch (faster, no persistent connection)
        const querySnapshot = await getDocs(q);
        const fetchedArticles = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            publishDate: data.publishDate ? data.publishDate.toDate() : new Date(),
          } as Article;
        });

        if (mounted) {
          setArticles(fetchedArticles);
          setIsLoading(false);
        }

        // Then set up real-time listener (non-blocking, happens after initial render)
        // This defers the Firestore channel connections that were blocking the critical path
        setTimeout(async () => {
          const database = await db(); // Get fresh reference
          if (mounted && database) {
            const realtimeQ = query(collection(database, 'articles'), orderBy('publishDate', 'desc'));
            unsubscribe = onSnapshot(realtimeQ, (snapshot) => {
              if (mounted) {
                const updatedArticles = snapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    ...data,
                    publishDate: data.publishDate ? data.publishDate.toDate() : new Date(),
                  } as Article;
                });
                setArticles(updatedArticles);
              }
            }, (error) => {
              console.error("Error in real-time listener: ", error);
            });
          }
        }, 200); // Increased delay for mobile
      } catch (error) {
        console.error("Error fetching articles: ", error);
        if (mounted) {
          showToast('Could not load articles from the database.', 'error');
          setIsLoading(false);
        }
      }
    };

    // Defer Firestore connection until after initial render (more aggressive for mobile)
    // This reduces critical path from 5+ seconds to < 1 second
    if (typeof requestIdleCallback !== 'undefined') {
      const idleId = requestIdleCallback(loadArticles, { timeout: 3000 });
      return () => {
        mounted = false;
        cancelIdleCallback(idleId);
        if (unsubscribe) {
          unsubscribe();
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    } else {
      timeoutId = setTimeout(loadArticles, 300); // Increased delay for mobile
      return () => {
        mounted = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, []);
  
  const showToast = (message: string, type: 'success' | 'error') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prevToasts => [...prevToasts, newToast]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== newToast.id));
    }, 5000);
  };

  const selectedArticle = articles.find(article => article.id === selectedArticleId) || null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedArticleId, view]);

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setView('detail');
    setSearchQuery('');
  };

  const handleBackToList = () => {
    setSelectedArticleId(null);
    setView('list');
  };
  
  const handleNavigateToCreate = () => {
    setEditingArticle(null);
    setView('create');
    setSearchQuery('');
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setView('create');
    setSearchQuery('');
  };
  
  const handleArticleCreated = async (articleData: Pick<Article, 'title' | 'content' | 'imageUrl'>, articleId?: string) => {
    const articlePayload = {
      ...articleData,
      excerpt: articleData.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
      readingTime: Math.ceil(articleData.content.split(' ').length / 200),
    };

    try {
      if (articleId && editingArticle) {
        // Update existing article (author info is preserved automatically)
        await updateArticle(articleId, articlePayload);
        showToast('Article updated successfully!', 'success');
      } else {
        // Create new article - require user to be signed in
        if (!user) {
          showToast('Please sign in with Google to create articles.', 'error');
          return;
        }

        const authorName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
        const authorAvatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;
        
        const newArticleData = {
          ...articlePayload,
          author: {
            name: authorName,
            avatarUrl: authorAvatar,
          },
          category: 'AI Generated',
        };
        await addArticle(newArticleData);
        showToast('Article published successfully!', 'success');
      }
      setEditingArticle(null);
      setView('list');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save article.';
      showToast(errorMessage, 'error');
    }
  };

  // Migrate old articles once when user signs in
  const [migrationDone, setMigrationDone] = useState(false);
  useEffect(() => {
    if (user && user.displayName && user.photoURL && !migrationDone) {
      // Run migration once when user signs in
      migrateOldArticles(user.displayName, user.photoURL)
        .then((count) => {
          if (count > 0) {
            showToast(`Updated ${count} article(s) with your account information.`, 'success');
          }
          setMigrationDone(true);
        })
        .catch((error) => {
          console.error('Migration error:', error);
          // Don't show error to user, just log it
          setMigrationDone(true); // Mark as done even on error to prevent retries
        });
    }
  }, [user?.uid]); // Only run when user ID changes (i.e., on sign in)

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && view !== 'list') {
      setView('list');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <ArticleListSkeleton />;
    }
    
    switch (view) {
      case 'detail':
        return selectedArticle ? (
          <Suspense fallback={<ArticleListSkeleton />}>
            <ArticleDetail 
              article={selectedArticle} 
              onBack={handleBackToList} 
              onEdit={handleEditArticle}
              showToast={showToast} 
            />
          </Suspense>
        ) : null;
      case 'create':
        return (
          <Suspense fallback={<ArticleListSkeleton />}>
            <CreatePost 
              article={editingArticle || undefined}
              onArticleCreated={handleArticleCreated} 
              onCancel={handleBackToList} 
              showToast={showToast} 
            />
          </Suspense>
        );
      case 'list':
      default:
        return (
          <Suspense fallback={<ArticleListSkeleton />}>
            <ArticleList articles={articles} onSelectArticle={handleSelectArticle} searchQuery={searchQuery} />
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-light-text dark:text-dark-text">
      <SEO article={selectedArticle || undefined} />
      <Suspense fallback={<div className="h-16 bg-light-card dark:bg-dark-card" />}>
        <Header 
          onNavigateHome={handleBackToList} 
          onNavigateToCreate={handleNavigateToCreate} 
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
      </Suspense>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <Suspense fallback={<div className="h-20 bg-light-card dark:bg-dark-card" />}>
        <Footer />
      </Suspense>
      <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(currentToasts => currentToasts.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </div>
  );
};

export default App;
