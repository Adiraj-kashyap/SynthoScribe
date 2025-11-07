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
      <div className="aspect-w-16 aspect-h-9">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <span className="inline-block bg-brand-secondary/10 text-brand-secondary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 self-start">
          {article.category}
        </span>
        <h3 className="text-xl font-bold mb-2 flex-grow group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors duration-300">
          {article.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {article.excerpt}
        </p>
        <div className="flex items-center mt-auto">
          <img src={article.author.avatarUrl} alt={article.author.name} className="w-10 h-10 rounded-full mr-3"/>
          <div>
            <p className="font-semibold text-sm">{article.author.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formattedDate} &middot; {article.readingTime} min read
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
