import { useEffect } from 'react';

// Keeps the browser tab title in step with the current page.
export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | Margalla Motion` : 'Margalla Motion';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
