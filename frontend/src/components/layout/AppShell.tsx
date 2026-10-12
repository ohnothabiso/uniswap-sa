import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="flex-1 w-full" id="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};
