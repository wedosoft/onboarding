import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 transition-all duration-300 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
