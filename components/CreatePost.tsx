import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { generateContent, generateImageFromPrompt } from '../lib/functions';
import { uploadImage } from '../lib/storage';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import Modal from './Modal';

interface CreatePostProps {
  article?: Article; // If provided, we're in edit mode
  onArticleCreated: (articleData: Pick<Article, 'title' | 'content' | 'imageUrl'>, articleId?: string) => void;
  onCancel: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ article, onArticleCreated, onCancel, showToast }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setImageUrl(article.imageUrl);
    }
  }, [article]);

  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Title and content cannot be empty.', 'error');
      return;
    }
    if (!imageUrl) {
      showToast('Please generate or upload a featured image.', 'error');
      return;
    }
    onArticleCreated({ title, content, imageUrl }, article?.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB.', 'error');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to upload image.', 'error');
    } finally {
      setIsUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };
  
  const handleDraftPost = async () => {
    if (!title.trim()) {
      showToast("Please provide a title to draft a post.", "error");
      return;
    }
    setIsLoadingDraft(true);
    
    try {
      const systemPrompt = "You are an expert blog post writer. Write a clear, engaging, and well-structured blog post based on the provided title. The output should be raw HTML content suitable for a blog, including paragraphs (<p>), headings (<h3>), lists (<ul><li>), etc.";
      const result = await generateContent(`Write a blog post about: "${title}"`, systemPrompt);
      setContent(result);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
    } finally {
      setIsLoadingDraft(false);
    }
  };
  
  const handleBrainstormTitles = async () => {
    if (!content.trim()) {
      showToast("Please write some content to brainstorm titles.", "error");
      return;
    }
    setIsLoadingTitles(true);
    
    try {
      const systemPrompt = "You are a marketing expert specializing in catchy headlines. Generate 5 blog post titles based on the following content. Return *only* the titles, each on a new line, without any numbering or bullet points.";
      const contentSnippet = content.substring(0, 1500);
      const result = await generateContent(contentSnippet, systemPrompt);
      setTitleSuggestions(result.split('\n').filter(t => t.trim() !== ''));
      setShowTitleModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
    } finally {
      setIsLoadingTitles(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!title.trim()) {
      showToast("Please provide a title to generate an image.", "error");
      return;
    }
    setIsLoadingImage(true);
    try {
        const generatedImageUrl = await generateImageFromPrompt(title);
        setImageUrl(generatedImageUrl);
    } catch (err) {
        showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
    } finally {
        setIsLoadingImage(false);
    }
  };

  const selectTitle = (selectedTitle: string) => {
    setTitle(selectedTitle);
    setShowTitleModal(false);
  };

  return (
    <>
      {showTitleModal && (
        <Modal title="✨ AI Title Suggestions" onClose={() => setShowTitleModal(false)}>
          <ul className="space-y-2">
            {titleSuggestions.length > 0 ? titleSuggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => selectTitle(suggestion)}
                  className="w-full text-left p-3 rounded-lg text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                >
                  {suggestion}
                </button>
              </li>
            )) : <p className="text-gray-500">No suggestions were generated. You can try again.</p>}
          </ul>
        </Modal>
      )}

      <div className="max-w-4xl mx-auto bg-light-card dark:bg-dark-card p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-light-text dark:text-dark-text mb-4 sm:mb-6">
          {article ? 'Edit Post' : 'Create a New Post'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column: Text Inputs */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="title" className="block text-lg font-semibold text-light-text dark:text-dark-text">Title</label>
                  <button
                    type="button"
                    onClick={handleBrainstormTitles}
                    disabled={isLoadingTitles || !content}
                    className="flex items-center space-x-1.5 text-sm text-brand-secondary font-medium hover:text-brand-primary dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingTitles ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                    <span>Brainstorm Titles</span>
                  </button>
                </div>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="content" className="block text-lg font-semibold text-light-text dark:text-dark-text">Content (HTML)</label>
                  <button
                    type="button"
                    onClick={handleDraftPost}
                    disabled={isLoadingDraft || !title}
                    className="flex items-center space-x-1.5 text-sm text-brand-secondary font-medium hover:text-brand-primary dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingDraft ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                    <span>Draft with AI</span>
                  </button>
                </div>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={18}
                  className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono text-sm"
                  placeholder="Write your post content here, or use the AI drafter above. HTML is supported."
                />
              </div>
            </div>

            {/* Right Column: Image Generation & Upload */}
            <div>
                <label className="block text-base sm:text-lg font-semibold text-light-text dark:text-dark-text mb-2">Featured Image</label>
                <div className="relative w-full h-48 sm:h-56 md:h-64 bg-light-bg dark:bg-dark-bg rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center overflow-hidden">
                    {(isLoadingImage || isUploadingImage) && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white rounded-lg z-10">
                           <SpinnerIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                           <p className="mt-2 text-xs sm:text-sm font-semibold">
                             {isLoadingImage ? 'Generating Image...' : 'Uploading Image...'}
                           </p>
                        </div>
                    )}
                    {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt="Generated preview" 
                          className="w-full h-full object-cover rounded-lg"
                          loading="eager"
                          decoding="async"
                        />
                    ) : (
                        <div className="text-center text-gray-400 px-4">
                           <PhotoIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12" />
                           <p className="mt-2 text-xs sm:text-sm">Generate or upload an image</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 space-y-2">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage || isLoadingImage}
                      className="hidden"
                      id="image-upload"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={isUploadingImage || isLoadingImage}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <PhotoIcon className="w-5 h-5" />
                      <span>Upload Image</span>
                    </button>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isLoadingImage || isUploadingImage || !title}
                    className="w-full flex items-center justify-center space-x-2 bg-brand-secondary/80 hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    <span>Generate Image</span>
                  </button>
                </div>
            </div>
          </div>


          <div className="flex justify-end space-x-4 pt-4 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-brand-primary hover:bg-brand-secondary text-white font-semibold transition-colors"
            >
              {article ? 'Update Post' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePost;
