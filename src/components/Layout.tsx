import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 flex w-full h-full overflow-hidden">
      {children}
    </div>
  );
};