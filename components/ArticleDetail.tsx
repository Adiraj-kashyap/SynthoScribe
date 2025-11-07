import React from 'react';
import { Article, Comment } from '../types';
import AdBanner from './AdBanner';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { generateContent } from '../lib/functions';
import { addComment, deleteArticle } from '../lib/firestore';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { useAuth } from '../lib/auth';


interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onEdit?: (article: Article) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, onEdit, showToast }) => {
  const { isAdmin } = useAuth();
  const [summary, setSummary] = React.useState('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>([]);

  React.useEffect(() => {
    if (!article.id) return;

    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    // Async function to set up Firestore listener
    const setupCommentsListener = async () => {
      try {
        const database = await db();
        if (!database || !mounted) return;

        const commentsCol = collection(database, 'comments');
        const q = query(commentsCol, where('articleId', '==', article.id), orderBy('createdAt', 'asc'));

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          if (!mounted) return;
          const fetchedComments = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              articleId: data.articleId,
              author: data.author,
              avatarUrl: data.avatarUrl,
              content: data.content,
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            } as Comment;
          });
          setComments(fetchedComments);
        }, (error) => {
          console.error("Error fetching comments: ", error);
          if (mounted) {
            showToast('Could not load comments.', 'error');
          }
        });
      } catch (error) {
        console.error("Error setting up comments listener: ", error);
        if (mounted) {
          showToast('Could not load comments.', 'error');
        }
      }
    };

    setupCommentsListener();

    // Cleanup listener on component unmount
    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [article.id, showToast]);

  const handleGenerateSummary = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    setSummary('');

    try {
      const plainTextContent = new DOMParser().parseFromString(article.content, 'text/html').documentElement.textContent || '';
      // Pass isPublic=true for summarize - this allows unauthenticated users to use it
      const result = await generateContent(
        plainTextContent, 
        "You are a helpful blog assistant. Summarize the following post concisely in a single, well-written paragraph.",
        true // isPublic = true for summarize
      );
      setSummary(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleAddComment = async (author: string, content: string, avatarUrl?: string) => {
    try {
      await addComment(article.id, author, content, avatarUrl);
      showToast('Comment posted successfully!', 'success');
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to post comment.';
       showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteArticle(article.id);
      showToast('Article deleted successfully!', 'success');
      onBack();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete article.';
      showToast(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(article);
    }
  };

  const formattedDate = article.publishDate instanceof Date 
    ? article.publishDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date not available';

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-brand-secondary hover:text-brand-primary dark:hover:text-blue-400 font-semibold transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Articles</span>
        </button>
        {isAdmin && onEdit && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-brand-secondary hover:bg-brand-primary text-white font-semibold rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <header className="mb-6 sm:mb-8 text-center px-2">
        <span className="text-brand-secondary font-semibold text-sm sm:text-base">{article.category}</span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-light-text dark:text-dark-text my-3 sm:my-4 leading-tight px-2">
          {article.title}
        </h1>
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-4 sm:mt-6">
          <img 
            src={article.author.avatarUrl} 
            alt={article.author.name} 
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base md:text-lg truncate">{article.author.name}</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">{formattedDate} &middot; </span>
              {article.readingTime} min read
            </p>
          </div>
        </div>
      </header>

      <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden shadow-2xl">
         <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-light-bg dark:bg-dark-bg">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
      </div>
      
      {/* AI Summary Section */}
      <div className="my-10 p-6 bg-light-card dark:bg-dark-card rounded-lg shadow-lg border border-light-border dark:border-dark-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
           <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">AI-Powered Summary</h3>
            <button
              onClick={handleGenerateSummary}
              disabled={isSummarizing}
              className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isSummarizing ? (
                <>
                  <SpinnerIcon className="w-5 h-5" />
                  <span>Generating...</span>
                </>
              ) : (
                 <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Summarize</span>
                 </>
              )}
            </button>
        </div>
        {summary && <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>}
      </div>


      <div
        className="prose prose-lg dark:prose-invert max-w-none text-light-text dark:text-dark-text"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
        
      {/* Ad Banner Placeholder */}
      <div className="my-10">
        <AdBanner />
      </div>
      
      {/* Comment Section */}
      <div className="my-10 pt-8 border-t border-light-border dark:border-dark-border">
          <h2 className="text-3xl font-extrabold text-light-text dark:text-dark-text mb-6">
            Comments ({comments.length})
          </h2>
          <CommentList comments={comments} />
          <CommentForm onSubmit={handleAddComment} />
      </div>
    </article>
  );
};

export default ArticleDetail;
