import React, { useState, useMemo } from 'react';
import { Article } from '../types';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (id: string) => void;
  searchQuery: string;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, onSelectArticle, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => ['All', ...new Set(articles.map(a => a.category))], [articles]);
  
  const filteredArticles = useMemo(() => {
    let articlesToFilter = articles;
    
    // Filter by category first
    if (selectedCategory !== 'All') {
      articlesToFilter = articlesToFilter.filter(article => article.category === selectedCategory);
    }

    // Then filter by search query
    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      articlesToFilter = articlesToFilter.filter(article =>
        article.title.toLowerCase().includes(lowercasedQuery) ||
        article.excerpt.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    return articlesToFilter;
  }, [articles, selectedCategory, searchQuery]);

  if (articles.length === 0 && !searchQuery) {
    return <p>No articles found.</p>;
  }

  const [firstArticle, ...restArticles] = filteredArticles;

  return (
    <div className="space-y-12">
      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
              selectedCategory === category
                ? 'bg-brand-primary text-white'
                : 'bg-light-card dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Hero Section for the first article */}
      {firstArticle && (
        <div 
          className="group cursor-pointer"
          onClick={() => onSelectArticle(firstArticle.id)}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelectArticle(firstArticle.id)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 items-center bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg bg-light-bg dark:bg-dark-bg">
              <img 
                src={firstArticle.imageUrl} 
                alt={firstArticle.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <div>
              <span className="inline-block bg-brand-secondary/10 text-brand-secondary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                {firstArticle.category}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-light-text dark:text-dark-text mb-3 sm:mb-4 group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors">
                {firstArticle.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 line-clamp-3">
                {firstArticle.excerpt}
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img 
                  src={firstArticle.author.avatarUrl} 
                  alt={firstArticle.author.name} 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">{firstArticle.author.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="hidden sm:inline">
                      {firstArticle.publishDate instanceof Date ? firstArticle.publishDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date not available'} &middot;{' '}
                    </span>
                    {firstArticle.readingTime} min read
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid for the rest of the articles */}
      {restArticles.length > 0 && (
        <div>
           <h3 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-brand-primary/20">More Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restArticles.map(article => (
              <ArticleCard key={article.id} article={article} onSelectArticle={onSelectArticle} />
            ))}
          </div>
        </div>
      )}
      
      {filteredArticles.length === 0 && (
         <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              {searchQuery ? `No articles found for "${searchQuery}".` : 'No articles found in this category.'}
            </p>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
