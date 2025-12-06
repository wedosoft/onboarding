import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ScenariosPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/curriculum', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500">새로운 시나리오 페이지로 이동 중...</p>
      </div>
    </div>
  );
};

export default ScenariosPage;
