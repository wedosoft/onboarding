import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const ScenariosPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/curriculum', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-muted-foreground mt-4">새로운 시나리오 페이지로 이동 중...</p>
      </div>
    </div>
  );
};

export default ScenariosPage;
