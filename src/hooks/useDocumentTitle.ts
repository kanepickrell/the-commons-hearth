// src/hooks/useDocumentTitle.ts
// Set the document title for one route, and put it back on the way out.
//
// The site is a single-document SPA: index.html carries one <title> for every
// route, so without this a page can only ever be called "Central Texas
// Catholic Land Movement" in the tab, in a bookmark, and in browser history.
//
// Restoring on unmount is the part that matters. Setting document.title in an
// effect without a cleanup leaves the last page's title sitting in the tab
// after the reader navigates somewhere that doesn't set one, which is worse
// than the single static title it replaced. The previous value is captured at
// mount rather than hard-coded so this composes if a parent ever sets one too.

import { useEffect } from 'react';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
};
