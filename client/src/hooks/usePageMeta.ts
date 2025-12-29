import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description?: string;
}

export const usePageMeta = ({ title, description }: PageMetaOptions) => {
  useEffect(() => {
    // Set page title
    document.title = title;

    // Set meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);
};
