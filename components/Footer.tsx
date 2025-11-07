
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} AI Content Platform. All rights reserved.</p>
        <p className="text-sm mt-1">Phase 1: Foundational MVP</p>
      </div>
    </footer>
  );
};

export default Footer;
