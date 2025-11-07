import React from 'react';
import { Comment } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-4">
          <UserCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
          <div className="flex-1 bg-light-bg dark:bg-dark-bg p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-light-text dark:text-dark-text">{comment.author}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {comment.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;