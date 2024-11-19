import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="fixed inset-0 w-full h-full flex bg-white overflow-hidden">
    {children}
  </div>
);