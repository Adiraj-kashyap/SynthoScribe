import React, { useState, useEffect } from 'react';
import { Article } from './types';
import { db } from './lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { addArticle, updateArticle, seedInitialArticles, migrateOldArticles } from './lib/firestore';
import { useAuth } from './lib/auth';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import CreatePost from './components/CreatePost';
import ArticleListSkeleton from './components/ArticleListSkeleton';
import Toast from './components/Toast';
import SEO from './components/SEO';

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

  // Seed the database on first load, then fetch articles from Firestore
  useEffect(() => {
    // This function will check if articles exist and add them if not.
    seedInitialArticles();

    if (!db) {
      setIsLoading(false);
      showToast("Could not connect to the database.", "error");
      return;
    }

    const articlesCol = collection(db, 'articles');
    const q = query(articlesCol, orderBy('publishDate', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedArticles = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          publishDate: data.publishDate ? data.publishDate.toDate() : new Date(),
        } as Article;
      });
      setArticles(fetchedArticles);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching articles: ", error);
      showToast('Could not load articles from the database.', 'error');
      setIsLoading(false);
    });

    return () => unsubscribe();
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
          <ArticleDetail 
            article={selectedArticle} 
            onBack={handleBackToList} 
            onEdit={handleEditArticle}
            showToast={showToast} 
          />
        ) : null;
      case 'create':
        return (
          <CreatePost 
            article={editingArticle || undefined}
            onArticleCreated={handleArticleCreated} 
            onCancel={handleBackToList} 
            showToast={showToast} 
          />
        );
      case 'list':
      default:
        return <ArticleList articles={articles} onSelectArticle={handleSelectArticle} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-light-text dark:text-dark-text">
      <SEO article={selectedArticle || undefined} />
      <Header 
        onNavigateHome={handleBackToList} 
        onNavigateToCreate={handleNavigateToCreate} 
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <Footer />
      <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(currentToasts => currentToasts.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </div>
  );
};

export default App;
