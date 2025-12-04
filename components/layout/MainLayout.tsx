import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
