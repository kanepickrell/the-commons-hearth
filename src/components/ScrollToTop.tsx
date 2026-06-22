// src/components/ScrollToTop.tsx
// Resets scroll to the top of the page on every route change, so a link at
// the bottom of one page lands you at the top of the next. Must render inside
// <BrowserRouter>. Locale toggles use history.replaceState (not a router
// navigation), so switching languages won't jump the scroll.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};