// src/components/ScrollToTop.tsx
// Resets scroll to the top of the page on every route change, so a link at
// the bottom of one page lands you at the top of the next. Must render inside
// <BrowserRouter>. The header's locale toggle navigates with
// `state.keepScroll` so switching languages doesn't jump the page.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  const keepScroll = (state as { keepScroll?: boolean } | null)?.keepScroll === true;

  useEffect(() => {
    if (keepScroll) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, keepScroll]);

  return null;
};
