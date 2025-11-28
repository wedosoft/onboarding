import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { structureKnowledge, getKnowledgeArticles, createKnowledgeArticle, deleteKnowledgeArticle, KnowledgeArticle } from '../services/apiClient';

// 범주 정의
const CATEGORIES = [
  { value: 'handover', label: '인수인계', icon: '📋', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'process', label: '업무 프로세스', icon: '💼', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  { value: 'tips', label: '팁 & 노하우', icon: '💡', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'company', label: '회사 생활', icon: '🏢', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  { value: 'tools', label: '시스템/도구', icon: '🔧', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  { value: 'etc', label: '기타', icon: '📚', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
];

const getCategoryInfo = (value: string) => {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
};

const KnowledgeSection: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<KnowledgeArticle | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('process');
  const [newContent, setNewContent] = useState('');

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getKnowledgeArticles(filterCategory || undefined);
      setArticles(data);
      if (data.length > 0 && !selectedArticle) {
        setSelectedArticle(data[0]);
      }
    } catch (error) {
      console.error('Failed to load knowledge articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    loadArticles();
  }, [filterCategory]);

  const handleProcessArticle = async () => {
    if (!newContent.trim() || !newAuthor.trim() || !newTitle.trim()) {
      alert('제목, 작성자, 내용을 모두 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      // AI로 구조화된 요약 생성
      const structuredSummary = await structureKnowledge(newContent, newCategory);

      // 저장
      const newArticle = await createKnowledgeArticle({
        title: newTitle,
        author: newAuthor,
        category: newCategory,
        rawContent: newContent,
        structuredSummary,
      });

      setArticles([newArticle, ...articles]);
      resetForm();
      setSelectedArticle(newArticle);
    } catch (error) {
      console.error('Failed to process article:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewAuthor('');
    setNewCategory('process');
    setNewContent('');
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteKnowledgeArticle(deleteConfirm.id);
      const updatedArticles = articles.filter(a => a.id !== deleteConfirm.id);
      setArticles(updatedArticles);
      if (selectedArticle?.id === deleteConfirm.id) {
        setSelectedArticle(updatedArticles[0] || null);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const filteredArticles = filterCategory
    ? articles.filter(a => a.category === filterCategory)
    : articles;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-slate-500 dark:text-slate-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left List */}
      <div className="w-1/3 flex flex-col gap-4">
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium shadow-md hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-plus" />
          새 글 작성
        </button>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 dark:text-slate-100"
        >
          <option value="">전체 범주</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
          ))}
        </select>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="fas fa-book text-4xl mb-3 opacity-30" />
              <p>아직 등록된 지식이 없습니다.</p>
            </div>
          ) : (
            filteredArticles.map(article => {
              const catInfo = getCategoryInfo(article.category);
              return (
                <div
                  key={article.id}
                  onClick={() => {
                    setSelectedArticle(article);
                    setIsFormOpen(false);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedArticle?.id === article.id
                      ? 'bg-white dark:bg-slate-800 border-sky-500 shadow-md ring-1 ring-sky-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{article.title}</h4>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{article.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${catInfo.color}`}>
                      {catInfo.icon} {catInfo.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {article.author}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{article.rawContent}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Detail View */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        {isFormOpen ? (
          <div className="p-8 flex flex-col h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">새 지식 등록</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              자유롭게 작성하세요. AI가 구조화된 요약을 생성합니다.
            </p>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                제목 *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="예: CRM 주간 업데이트 절차"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:text-slate-100"
              />
            </div>

            {/* Author & Category */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  작성자 *
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="예: 김과장"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  범주 *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:text-slate-100"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 min-h-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                내용 *
              </label>
              <textarea
                className="w-full h-full min-h-[200px] p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none dark:text-slate-100"
                placeholder="자유롭게 작성하세요. 예: 매주 금요일 5시까지 CRM 업데이트 필수. 업데이트 방법은..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={resetForm}
                className="px-6 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleProcessArticle}
                disabled={isProcessing || !newContent.trim() || !newAuthor.trim() || !newTitle.trim()}
                className="px-6 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic" />
                    AI 구조화 & 저장
                  </>
                )}
              </button>
            </div>
          </div>
        ) : selectedArticle ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedArticle.title}</h2>
                <button
                  onClick={() => setDeleteConfirm(selectedArticle)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryInfo(selectedArticle.category).color}`}>
                  {getCategoryInfo(selectedArticle.category).icon} {getCategoryInfo(selectedArticle.category).label}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedArticle.author}
                </span>
                <span className="text-sm text-slate-400">
                  {selectedArticle.createdAt}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <i className="fas fa-magic" /> AI 구조화 요약
                </h3>
                <div className="prose prose-sm prose-sky max-w-none bg-sky-50/50 dark:bg-sky-900/20 p-6 rounded-xl border border-sky-100 dark:border-sky-800">
                  <ReactMarkdown>{selectedArticle.structuredSummary || '요약 없음'}</ReactMarkdown>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <i className="fas fa-file-alt" /> 원본 내용
                </h3>
                <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border border-slate-100 dark:border-slate-600 text-sm whitespace-pre-wrap">
                  {selectedArticle.rawContent}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <i className="fas fa-book text-5xl mb-4 opacity-20" />
            <p>글을 선택하거나 새로 작성하세요</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <i className="fas fa-exclamation-triangle text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">삭제 확인</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              <span className="font-medium">"{deleteConfirm.title}"</span>을(를) 삭제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSection;
