import React from 'react';
import KnowledgeSection from '../components/KnowledgeSection';

const DocumentsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-700">
          지식 베이스
        </h2>
        <p className="text-sm text-slate-500">
          사내 지식을 AI가 구조화하여 정리합니다. 인수인계, 업무 프로세스, 팁 등 모든 지식을 공유하세요.
        </p>
      </div>

      {/* Knowledge Section */}
      <KnowledgeSection />
    </div>
  );
};

export default DocumentsPage;
