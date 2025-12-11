import React from 'react';
import KnowledgeSection from '../components/KnowledgeSection';
import { Card } from '@/components/ui/card';

const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6 py-6">
      {/* Knowledge Section */}
      <KnowledgeSection />
    </div>
  );
};

export default DocumentsPage;
