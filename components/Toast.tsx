import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
    
    // Set timeout to animate out before unmounting
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4500); // Start fade out 500ms before it's removed

    return () => clearTimeout(timer);
  }, []);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      role="alert"
      className={`relative flex items-center w-full px-4 py-3 mb-2 text-white rounded-lg shadow-lg transition-all duration-500 transform ${bgColor} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      onAnimationEnd={() => !isVisible && onClose()}
    >
      <div className="mr-3">
        <Icon className="w-6 h-6" />
      </div>
      <p className="flex-1 font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
