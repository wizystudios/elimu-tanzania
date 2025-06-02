
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 ${
          isMobile ? 'p-2' : 'p-4'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
