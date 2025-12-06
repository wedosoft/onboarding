import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className="h-screen pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
