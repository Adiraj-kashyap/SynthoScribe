import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onSelectArticle: (id: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelectArticle }) => {
  const formattedDate = article.publishDate instanceof Date 
    ? article.publishDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date not available';

  return (
    <div
      className="group bg-light-card dark:bg-dark-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
      onClick={() => onSelectArticle(article.id)}
    >
      <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-light-bg dark:bg-dark-bg">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <span className="inline-block bg-brand-secondary/10 text-brand-secondary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 self-start">
          {article.category}
        </span>
        <h3 className="text-lg sm:text-xl font-bold mb-2 flex-grow group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors duration-300 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center mt-auto">
          <img 
            src={article.author.avatarUrl} 
            alt={article.author.name} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex-shrink-0 object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs sm:text-sm truncate">{article.author.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">{formattedDate} &middot; </span>
              {article.readingTime} min read
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
