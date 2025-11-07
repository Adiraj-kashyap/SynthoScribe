import React from 'react';

const ArticleListSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Category Filters Skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-9 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div className="h-9 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div className="h-9 w-32 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>
      
      {/* Hero Section Skeleton */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
          <div className="aspect-w-16 aspect-h-9 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div>
            <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-4/6 mb-6"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-8"></div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-light-card dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-6">
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded-full mb-3"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleListSkeleton;
