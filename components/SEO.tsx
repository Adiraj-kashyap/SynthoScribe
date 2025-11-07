import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Article } from '../types';

interface SEOProps {
  article?: Article;
  defaultTitle?: string;
  defaultDescription?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  article, 
  defaultTitle = 'AI Content Platform MVP',
  defaultDescription = 'A modern content platform powered by AI'
}) => {
  const title = article ? `${article.title} | ${defaultTitle}` : defaultTitle;
  const description = article 
    ? article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
    : defaultDescription;
  const image = article?.imageUrl || '';
  const url = article ? `${window.location.origin}/article/${article.id}` : window.location.origin;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishDate.toISOString()} />
          <meta property="article:author" content={article.author.name} />
          <meta property="article:section" content={article.category} />
        </>
      )}
    </Helmet>
  );
};

export default SEO;

