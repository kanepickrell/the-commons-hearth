import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-cal">
    <Header />
    <main className="flex-1 fade-in">{children}</main>
    <Footer />
  </div>
);
