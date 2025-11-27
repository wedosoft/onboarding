import React, { useState, useEffect, useCallback } from 'react';
import { listDocuments, uploadDocument, deleteDocument, DocumentInfo } from '../services/apiClient';

const categoryOptions = [
  { value: 'handover', label: '인수인계' },
  { value: 'process', label: '업무 프로세스' },
  { value: 'product', label: '제품 지식' },
  { value: 'guide', label: '가이드/매뉴얼' },
];

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('handover');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [uploadTags, setUploadTags] = useState('');

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await listDocuments(selectedCategory || undefined);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const metadata: Array<{ key: string; stringValue: string }> = [
        { key: 'category', stringValue: uploadCategory },
      ];
      if (uploadAuthor.trim()) {
        metadata.push({ key: 'author', stringValue: uploadAuthor.trim() });
      }
      if (uploadTags.trim()) {
        metadata.push({ key: 'tags', stringValue: uploadTags.trim() });
      }

      await uploadDocument({
        file: uploadFile,
        metadata,
      });

      // Reset form and reload
      setUploadFile(null);
      setUploadCategory('handover');
      setUploadAuthor('');
      setUploadTags('');
      setShowUploadForm(false);
      await loadDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docName: string, displayName: string) => {
    if (!confirm(`"${displayName}" 문서를 삭제하시겠습니까?`)) return;

    try {
      await deleteDocument(docName);
      await loadDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const getMetadataValue = (doc: DocumentInfo, key: string): string => {
    const meta = doc.customMetadata?.find(m => m.key === key);
    return meta?.stringValue || '';
  };

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    const displayName = doc.displayName?.toLowerCase() || '';
    const tags = getMetadataValue(doc, 'tags').toLowerCase();
    return displayName.includes(searchQuery.toLowerCase()) || tags.includes(searchQuery.toLowerCase());
  });

  const getCategoryLabel = (value: string) => {
    return categoryOptions.find(c => c.value === value)?.label || value;
  };

  const getCategoryColor = (value: string) => {
    const colors: Record<string, string> = {
      handover: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      process: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      product: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      guide: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            인수인계 문서
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            업무 인수인계, 프로세스, 제품 지식 문서를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
        >
          <i className="fas fa-upload" />
          문서 업로드
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="문서명 또는 태그로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100"
        >
          <option value="">모든 카테고리</option>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Document list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-slate-500 dark:text-slate-400">문서 로딩 중...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-folder-open text-4xl text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery || selectedCategory ? '검색 결과가 없습니다.' : '업로드된 문서가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredDocuments.map((doc) => {
              const category = getMetadataValue(doc, 'category');
              const author = getMetadataValue(doc, 'author');
              const tags = getMetadataValue(doc, 'tags');

              return (
                <div
                  key={doc.name}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-file-alt text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {doc.displayName || doc.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(category)}`}>
                              {getCategoryLabel(category)}
                            </span>
                          )}
                          {author && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              <i className="fas fa-user mr-1" />
                              {author}
                            </span>
                          )}
                        </div>
                        {tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tags.split(',').map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.name, doc.displayName || doc.name)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                문서 업로드
              </h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  파일
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.txt,.md"
                  className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 dark:file:bg-sky-900 dark:file:text-sky-300"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  카테고리
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  작성자 (선택)
                </label>
                <input
                  type="text"
                  value={uploadAuthor}
                  onChange={(e) => setUploadAuthor(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  태그 (선택, 쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="예: CRM, 고객관리, 매뉴얼"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isUploading ? '업로드 중...' : '업로드'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
