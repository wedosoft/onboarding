import React from 'react';
import KnowledgeSection from '../components/KnowledgeSection';

const DocumentsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h2 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 mb-2">
          지식 베이스
        </h2>
        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
          팀의 소중한 지식을 AI가 자동으로 정리해드립니다. 인수인계 문서, 업무 가이드, 꿀팁들을 한곳에서 확인하세요.
        </p>
      </div>

      {/* Knowledge Section */}
      <KnowledgeSection />
    </div>
  );
};

export default DocumentsPage;
