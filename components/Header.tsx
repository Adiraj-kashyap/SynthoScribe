import React from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../lib/auth';

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateToCreate: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateToCreate, searchQuery, onSearch }) => {
  const { user, isAdmin, loading, signIn, signOut } = useAuth();

  const handleAuthClick = async () => {
    if (user) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    } else {
      try {
        await signIn();
      } catch (error: any) {
        console.error('Error signing in:', error);
        // Show user-friendly error message
        const errorMessage = error?.message || 'Failed to sign in. Please try again.';
        alert(errorMessage);
      }
    }
  };

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button onClick={onNavigateHome} className="flex items-center space-x-3 group flex-shrink-0">
            <BookOpenIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="text-xl md:text-2xl font-bold text-light-text dark:text-dark-text tracking-tight group-hover:text-brand-secondary transition-colors">
              Content Platform
            </h1>
          </button>
          
          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-md">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:text-light-text dark:focus:text-dark-text focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="Search articles..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <ThemeToggle />
            {!loading && (
              <>
                {isAdmin && (
                  <button 
                    onClick={onNavigateToCreate}
                    className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    aria-label="Create new post"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">New Post</span>
                  </button>
                )}
                <button
                  onClick={handleAuthClick}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                  aria-label={user ? 'Sign out' : 'Sign in'}
                >
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-light-text dark:text-dark-text">
                    {user ? (user.displayName || user.email?.split('@')[0] || 'User') : 'Sign In'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;