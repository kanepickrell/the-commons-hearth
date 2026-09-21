import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChesterWidget } from './chester/ChesterWidget';

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-cal">
    <Header />
    <main className="flex-1 fade-in">{children}</main>
    <Footer />
    <ChesterWidget />
  </div>
);
