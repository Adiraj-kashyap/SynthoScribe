export interface Article {
  id: string;
  title: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  publishDate: Date; // Changed from string to Date
  imageUrl: string;
  excerpt: string;
  content: string;
  category: string;
  readingTime: number;
}

export interface Comment {
  id: string; // Firestore document ID
  articleId: string;
  author: string;
  content: string;
  createdAt: Date; // For sorting and display
}
