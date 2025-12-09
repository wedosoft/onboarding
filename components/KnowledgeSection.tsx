import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { structureKnowledge, getKnowledgeArticles, createKnowledgeArticle, deleteKnowledgeArticle, KnowledgeArticle } from '../services/apiClient';

// 범주 정의
const CATEGORIES = [
  { value: 'handover', label: '인수인계', icon: '📋', color: 'bg-blue-500 text-white', dot: 'bg-blue-500' },
  { value: 'process', label: '업무 프로세스', icon: '💼', color: 'bg-emerald-500 text-white', dot: 'bg-emerald-500' },
  { value: 'tips', label: '팁 & 노하우', icon: '💡', color: 'bg-amber-500 text-white', dot: 'bg-amber-500' },
  { value: 'company', label: '회사 생활', icon: '🏢', color: 'bg-purple-500 text-white', dot: 'bg-purple-500' },
  { value: 'tools', label: '시스템/도구', icon: '🔧', color: 'bg-orange-500 text-white', dot: 'bg-orange-500' },
  { value: 'etc', label: '기타', icon: '📚', color: 'bg-muted-foreground text-white', dot: 'bg-muted-foreground' },
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
  }, [filterCategory, selectedArticle]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

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
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">자료를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 -mt-2">
      {/* Left List */}
      <div className="w-1/3 flex flex-col gap-4">
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus" />
            새 글 작성
          </button>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <i className="fas fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-ring text-foreground appearance-none shadow-sm cursor-pointer hover:border-primary transition-colors"
          >
            <option value="">전체 카테고리 보기</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 scrollbar-hide">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <i className="fas fa-folder-open text-2xl opacity-40" />
              </div>
              <p>등록된 글이 없습니다.</p>
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
                  className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md
                    ${selectedArticle?.id === article.id && !isFormOpen
                      ? 'bg-card border-primary shadow-md ring-1 ring-primary/10'
                      : 'bg-card/60 border-border/40 hover:bg-card hover:border-border'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`font-bold text-base mb-1 line-clamp-1 ${selectedArticle?.id === article.id ? 'text-primary' : 'text-foreground'}`}>
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] text-muted-foreground font-bold">
                      {article.author[0]}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {article.author}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Detail View */}
      <div className="flex-1 glass-card rounded-3xl border border-border/50 shadow-xl shadow-border/50 overflow-hidden flex flex-col relative bg-card/30 backdrop-blur-sm">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-30 pointer-events-none"></div>

        {isFormOpen ? (
          <div className="p-8 flex flex-col h-full overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">새 지식 등록</h2>
              <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <p className="text-muted-foreground mb-6 text-sm bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex items-start gap-2">
              <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              <span>내용을 자유롭게 작성하면 AI가 자동으로 구조화하여 <strong className="text-blue-500">요약본</strong>을 생성합니다.</span>
            </p>

            <div className="space-y-4 flex-1 flex flex-col">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">
                  제목
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: CRM 주간 업데이트 절차"
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary focus:bg-card text-foreground transition"
                />
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">
                    작성자
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="예: 김과장"
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary focus:bg-card text-foreground transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">
                    카테고리
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary focus:bg-card text-foreground transition appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 min-h-[200px] flex flex-col">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">
                  내용
                </label>
                <textarea
                  className="flex-1 w-full p-4 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary focus:bg-card resize-none text-foreground placeholder-muted-foreground transition leading-relaxed text-sm"
                  placeholder="공유하고 싶은 지식을 자유롭게 작성해주세요..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleProcessArticle}
                disabled={isProcessing || !newContent.trim() || !newAuthor.trim() || !newTitle.trim()}
                className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/30 transform active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI 분석 중...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic" />
                    <span>저장하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : selectedArticle ? (
          <div className="flex flex-col h-full relative z-10">
            {/* Detail Header */}
            <div className="p-8 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${getCategoryInfo(selectedArticle.category).color}`}>
                  {getCategoryInfo(selectedArticle.category).icon} {getCategoryInfo(selectedArticle.category).label}
                </span>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <i className="far fa-clock"></i> {new Date(selectedArticle.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h2 className="text-3xl font-display font-bold text-foreground leading-tight">
                  {selectedArticle.title}
                </h2>
                <button
                  onClick={() => setDeleteConfirm(selectedArticle)}
                  className="w-10 h-10 rounded-xl bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 flex items-center justify-center transition-all flex-shrink-0"
                  title="삭제"
                >
                  <i className="fas fa-trash-alt" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center text-muted-foreground font-bold text-xs ring-2 ring-card shadow-sm">
                  {selectedArticle.author[0]}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {selectedArticle.author}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-8 mb-4"></div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8">
              {/* AI Summary Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl transform rotate-1"></div>
                <div className="relative bg-card/60 backdrop-blur-md border border-primary/20 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"><i className="fas fa-magic" /></span>
                    AI 요약 노트
                  </h3>
                  <div className="prose prose-sm max-w-none prose-headings:text-primary prose-p:text-foreground prose-strong:text-primary">
                    <ReactMarkdown>{selectedArticle.structuredSummary || '_요약 내용이 없습니다._'}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Raw Content Section */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2 px-2">
                  <i className="fas fa-align-left" /> 원본 내용
                </h3>
                <div className="text-muted-foreground bg-muted/50 p-6 rounded-2xl border border-border/60 leading-relaxed whitespace-pre-wrap text-sm">
                  {selectedArticle.rawContent}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground relative z-10">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-book-open text-4xl opacity-20" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">선택된 글이 없습니다</p>
            <p className="text-sm">목록에서 글을 선택하거나 새로운 지식을 공유해보세요.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-border transform transition-all scale-100">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-exclamation-triangle text-destructive text-xl" />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">삭제하시겠습니까?</h3>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              <span className="font-semibold text-foreground">"{deleteConfirm.title}"</span><br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-muted-foreground hover:bg-muted font-medium rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl transition-colors shadow-lg shadow-destructive/30"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSection;
