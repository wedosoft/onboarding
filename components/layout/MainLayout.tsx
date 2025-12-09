import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import PageContainer from './PageContainer';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopNav />
      <main className="flex-1 min-h-0 w-full bg-background">
        <PageContainer
          width="wide"
          className="flex flex-col gap-8 py-8 lg:py-12 min-h-[calc(100vh-4rem)]"
        >
          <div className="flex flex-col flex-1">
            <Outlet />
          </div>
        </PageContainer>
      </main>
    </div>
  );
};

export default MainLayout;
