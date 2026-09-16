import { useEffect } from 'react';

export function useDocumentTitle(title, description = null) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | EventForge` : 'EventForge | Enterprise Conference Platform';

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }

    return () => {
      document.title = prevTitle;
    };
  }, [title, description]);
}

export default useDocumentTitle;
