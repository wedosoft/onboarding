import React from 'react';
import KnowledgeSection from '../components/KnowledgeSection';
import { Card } from '@/components/ui/card';

const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          자료실
        </h1>
        <p className="text-sm text-muted-foreground">
          팀의 소중한 지식을 AI가 자동으로 정리해드립니다
        </p>
      </Card>

      {/* Knowledge Section */}
      <KnowledgeSection />
    </div>
  );
};

export default DocumentsPage;
