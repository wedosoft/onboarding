import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Landing from './components/Landing';
import DashboardPage from './pages/DashboardPage';
import ScenariosPage from './pages/ScenariosPage';
import AssessmentPage from './pages/AssessmentPage';
import WorkSenseAssessmentPage from './pages/WorkSenseAssessmentPage';
import ProductKnowledgeLevelsPage from './pages/ProductKnowledgeLevelsPage';
import ProductKnowledgeLevelPage from './pages/ProductKnowledgeLevelPage';
import KnowledgeChatPage from './pages/KnowledgeChatPage';
import DocumentsPage from './pages/DocumentsPage';
import AdminPage from './pages/AdminPage';

// Product Knowledge Pages
import ProductSelectionPage from './pages/ProductSelectionPage';
import ProductCategoriesPage from './pages/ProductCategoriesPage';
import CategoryLearningPage from './pages/CategoryLearningPage';
import ProductChatPage from './pages/ProductChatPage';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-500">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin route wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // 관리자 체크
  const isAdmin = user?.email === 'alan@wedosoft.net';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Handle login page redirect (for Landing component compatibility)
  const handleLoginStart = () => {
    // After login, user will be redirected to dashboard
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route - Login */}
        <Route
          path="/login"
          element={
            isLoading ? (
              <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : user ? (
              <Navigate to="/" replace />
            ) : (
              <Landing onStart={handleLoginStart} />
            )
          }
        />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessment/:trackId" element={<WorkSenseAssessmentPage />} />
          <Route path="/assessment/:trackId/levels" element={<ProductKnowledgeLevelsPage />} />
          <Route path="/assessment/:trackId/level/:levelId" element={<ProductKnowledgeLevelPage />} />
          <Route path="/knowledge" element={<KnowledgeChatPage />} />
          <Route path="/documents" element={<DocumentsPage />} />

          {/* Product Knowledge Routes */}
          <Route path="/assessment/products" element={<ProductSelectionPage />} />
          <Route path="/assessment/products/:productId" element={<ProductCategoriesPage />} />
          <Route path="/assessment/products/:productId/chat" element={<ProductChatPage />} />
          <Route path="/assessment/products/:productId/:categorySlug" element={<CategoryLearningPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
