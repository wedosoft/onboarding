import React from 'react';
import KnowledgeSection from '../components/KnowledgeSection';

const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          자료실
        </h1>
        <p className="text-sm text-gray-600">
          팀의 소중한 지식을 AI가 자동으로 정리해드립니다
        </p>
      </div>

      {/* Knowledge Section */}
      <KnowledgeSection />
    </div>
  );
};

export default DocumentsPage;
