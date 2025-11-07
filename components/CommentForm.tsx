import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';

interface CommentFormProps {
  onSubmit: (author: string, content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Auto-fill author name from authenticated user
  useEffect(() => {
    if (user) {
      setAuthor(user.displayName || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      setError('Both name and comment fields are required.');
      return;
    }
    onSubmit(author, content);
    // Don't clear author if user is logged in
    if (!user) {
      setAuthor('');
    }
    setContent('');
    setError('');
  };

  return (
    <div className="mt-8 p-6 bg-light-card dark:bg-dark-card rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Leave a Comment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Name {user && <span className="text-xs text-gray-500">(from your account)</span>}
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={!!user}
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            placeholder="e.g., Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Comment
          </label>
          <textarea
            id="comment"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-1 focus:ring-brand-primary"
            placeholder="Share your thoughts..."
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="text-right">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-brand-primary hover:bg-brand-secondary text-white font-semibold transition-colors disabled:bg-gray-400"
            disabled={!author.trim() || !content.trim()}
          >
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
