import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="flex h-screen bg-white overflow-hidden">
    {children}
  </div>
);