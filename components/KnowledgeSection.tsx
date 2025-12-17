import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { structureKnowledge, getKnowledgeArticles, createKnowledgeArticle, updateKnowledgeArticle, deleteKnowledgeArticle, KnowledgeArticle } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import DOMPurify from 'dompurify';
import KnowledgeEditor, { type KnowledgeEditorRef } from './KnowledgeEditor';
import { extractTextFromHtml, normalizeLegacyContentToHtml, refreshSupabaseSignedUrlsInHtml } from '../services/knowledgeHtml';
import { createSignedUrl, uploadKnowledgeObject } from '../services/knowledgeStorage';
import { 
  Plus, Filter, FolderOpen, X, Info, Clock, Sparkles,
  Trash2, Edit, AlignLeft, BookOpen, TriangleAlert, Paperclip, Check, Loader2
} from 'lucide-react';

// 범주 정의
const CATEGORIES = [
  { value: 'handover', label: '인수인계', icon: '📋', color: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  { value: 'process', label: '업무 프로세스', icon: '💼', color: 'bg-blue-500/10 text-blue-600', dot: 'bg-blue-500' },
  { value: 'tips', label: '팁 & 노하우', icon: '💡', color: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
  { value: 'company', label: '회사 생활', icon: '🏢', color: 'bg-purple-500/10 text-purple-600', dot: 'bg-purple-500' },
  { value: 'tools', label: '시스템/도구', icon: '🔧', color: 'bg-orange-500/10 text-orange-600', dot: 'bg-orange-500' },
  { value: 'etc', label: '기타', icon: '📚', color: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
];

const getCategoryInfo = (value: string) => {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
};

type SaveMode = 'raw' | 'ai';

function hasMeaningfulContent(html: string): boolean {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = (doc.body.textContent || '').trim();
  if (text.length > 0) return true;
  if (doc.querySelector('img')) return true;
  if (doc.querySelector('a')) return true;
  return false;
}

function hasMeaningfulTextForAi(text: string): boolean {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // extractTextFromHtml()가 이미지 placeholder를 "[이미지]" 형태로 만들기 때문에
  // placeholder만 있는 경우에는 AI를 호출하지 않는다.
  const meaningful = lines.filter((l) => !/^\[[^\]]+\]$/.test(l));
  return meaningful.join(' ').trim().length > 0;
}

const KnowledgeSection: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<KnowledgeArticle | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const isFormOpenRef = useRef(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('process');
  const [newContentHtml, setNewContentHtml] = useState<string>('');
  const [saveMode, setSaveMode] = useState<SaveMode>('ai');
  const editorRef = useRef<KnowledgeEditorRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const editorLoadKeyRef = useRef<string | null>(null);
  const [attachmentItems, setAttachmentItems] = useState<
    Array<{
      id: string;
      name: string;
      status: 'uploading' | 'done' | 'error';
      url?: string;
      error?: string;
    }>
  >([]);

  // Initialize author when form opens or user loads
  useEffect(() => {
    if (user?.name) {
      setNewAuthor(user.name);
    }
  }, [user]);

  useEffect(() => {
    isFormOpenRef.current = isFormOpen;
  }, [isFormOpen]);

  const openCreateForm = () => {
    setNewTitle('');
    setNewAuthor(user?.name || '');
    setNewCategory('process');
    setNewContentHtml('');
    setSaveMode('ai');
    setEditingId(null);
    setAttachmentItems([]);
    setIsFormOpen(true);
  };

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getKnowledgeArticles(filterCategory || undefined);
      setArticles(data);
      setSelectedArticle((prev) => {
        if (isFormOpenRef.current) return prev;
        if (prev && data.some((a) => a.id === prev.id)) return prev;
        return data[0] || null;
      });
    } catch (error) {
      console.error('Failed to load knowledge articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleProcessArticle = async () => {
    if (!newAuthor.trim() || !newTitle.trim()) {
      alert('제목, 작성자를 모두 입력해주세요.');
      return;
    }

    const html = (await editorRef.current?.getHtml()) || newContentHtml;
    if (!hasMeaningfulContent(html)) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      let structuredSummary = '';
      if (saveMode === 'ai') {
        const extractedText = extractTextFromHtml(html);
        if (!hasMeaningfulTextForAi(extractedText)) {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const hasMedia = !!doc.querySelector('img, a');
          structuredSummary = hasMedia
            ? '이미지/첨부파일만 포함되어 있어 내용을 자동으로 파악할 수 없습니다. 본문에 설명 텍스트를 추가해 주세요.'
            : '내용을 파악할 수 없습니다. 본문을 입력해 주세요.';
        } else {
          structuredSummary = await structureKnowledge(extractedText, newCategory);
        }
      }

      if (editingId) {
        // 수정
        const updatedArticle = await updateKnowledgeArticle(editingId, {
          title: newTitle,
          author: newAuthor,
          category: newCategory,
          rawContent: html,
          structuredSummary,
        });

        setArticles(articles.map(a => a.id === editingId ? updatedArticle : a));
        setSelectedArticle(updatedArticle);
      } else {
        // 생성
        const newArticle = await createKnowledgeArticle({
          title: newTitle,
          author: newAuthor,
          category: newCategory,
          rawContent: html,
          structuredSummary,
        });

        setArticles([newArticle, ...articles]);
        setSelectedArticle(newArticle);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to process article:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewAuthor(user?.name || '');
    setNewCategory('process');
    setNewContentHtml('');
    setSaveMode('ai');
    setEditingId(null);
    setAttachmentItems([]);
    setIsFormOpen(false);
  };

  const handleEditClick = () => {
    if (!selectedArticle) return;
    setNewTitle(selectedArticle.title);
    setNewAuthor(selectedArticle.author);
    setNewCategory(selectedArticle.category);
    setNewContentHtml(selectedArticle.rawContent);
    setSaveMode((selectedArticle.structuredSummary || '').trim().length > 0 ? 'ai' : 'raw');
    setEditingId(selectedArticle.id);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!isFormOpen) {
      editorLoadKeyRef.current = null;
      return;
    }

    const loadKey = editingId ? `edit:${editingId}` : 'new';
    if (editorLoadKeyRef.current === loadKey) {
      return;
    }
    editorLoadKeyRef.current = loadKey;

    const raw = editingId
      ? (selectedArticle?.rawContent || newContentHtml || '<p></p>')
      : (newContentHtml || '<p></p>');
    const normalized = normalizeLegacyContentToHtml(raw);

    refreshSupabaseSignedUrlsInHtml(normalized)
      .then((refreshed) => editorRef.current?.setHtml(refreshed))
      .catch((error) => {
        console.error('Failed to load editor HTML:', error);
        editorRef.current?.setHtml(normalized).catch((e) => console.error('Failed to load editor HTML fallback:', e));
      });
  }, [isFormOpen, editingId, selectedArticle]);

  useEffect(() => {
    if (!selectedArticle) {
      setRenderedHtml('');
      return;
    }
    const html = normalizeLegacyContentToHtml(selectedArticle.rawContent);
    refreshSupabaseSignedUrlsInHtml(html)
      .then(setRenderedHtml)
      .catch((error) => {
        console.error('Failed to refresh signed URLs:', error);
        setRenderedHtml(html);
      });
  }, [selectedArticle]);

  const handleAttachClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleFileSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user?.id) {
      alert('첨부파일 업로드는 로그인 후 사용할 수 있습니다.');
      return;
    }

    try {
      setIsUploadingAttachments(true);
      const filesArr = Array.from(files);
      const batch = filesArr.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        status: 'uploading' as const,
      }));
      setAttachmentItems((prev) => [...batch, ...prev]);

      const errors: string[] = [];
      for (let i = 0; i < filesArr.length; i++) {
        const file = filesArr[i];
        const itemId = batch[i].id;
        try {
          const stored = await uploadKnowledgeObject(file, user.id);
          const url = await createSignedUrl(stored);
          editorRef.current?.insertFileBlock(file.name, url);
          setAttachmentItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, status: 'done', url } : it))
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : '첨부파일 업로드에 실패했습니다.';
          errors.push(message);
          setAttachmentItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, status: 'error', error: message } : it))
          );
        }
      }

      if (errors.length > 0) {
        alert(errors[0]);
      }
    } finally {
      setIsUploadingAttachments(false);
    }
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

  const attachmentUploadingCount = attachmentItems.filter((i) => i.status === 'uploading').length;
  const attachmentDoneCount = attachmentItems.filter((i) => i.status === 'done').length;
  const attachmentErrorCount = attachmentItems.filter((i) => i.status === 'error').length;

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
    <div className="flex h-[calc(100vh-12rem)] gap-6 -mt-2">
      {/* Left List */}
      <div className="w-[25%] flex flex-col gap-4">
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={openCreateForm}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 글 작성
          </button>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                <FolderOpen className="w-8 h-8 opacity-40" />
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
                  className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm
                    ${selectedArticle?.id === article.id && !isFormOpen
                      ? 'bg-card border-primary shadow-sm ring-1 ring-primary/10'
                      : 'bg-card/60 border-border/40 hover:bg-card hover:border-border'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      <span>• {article.author}</span>
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-1 ${selectedArticle?.id === article.id ? 'text-primary' : 'text-foreground'}`}>
                    {article.title}
                  </p>
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
          <div className="flex flex-col h-full relative z-10">
            <div className="p-8 pb-0 flex-none">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {editingId ? '지식 수정' : '새 지식 등록'}
                </h2>
                <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-muted-foreground mb-6 text-sm bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-blue-500">그대로 저장</strong> 또는 <strong className="text-blue-500">AI 요약 저장</strong>을 선택할 수 있습니다.
                </span>
              </p>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col px-8 space-y-4">
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
                    readOnly
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-muted-foreground cursor-not-allowed"
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

              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between gap-3 mb-1.5 ml-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    내용
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-border bg-card/60 p-0.5">
                      <button
                        type="button"
                        onClick={() => setSaveMode('raw')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                          saveMode === 'raw'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        그대로 저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaveMode('ai')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                          saveMode === 'ai'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        AI 요약 저장
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAttachClick}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card/60 text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                      title="첨부파일 업로드"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      첨부
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelected(e.target.files)}
                    />
                  </div>
                </div>
                {attachmentItems.length > 0 ? (
                  <div className="mb-2 ml-1">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      {isUploadingAttachments ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>첨부 업로드 중 ({attachmentUploadingCount}개)</span>
                        </>
                      ) : (
                        <span>
                          첨부 {attachmentDoneCount}개{attachmentErrorCount > 0 ? ` (실패 ${attachmentErrorCount}개)` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {attachmentItems.slice(0, 8).map((item) => {
                        const baseClass =
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] max-w-[320px] truncate';
                        if (item.status === 'uploading') {
                          return (
                            <span
                              key={item.id}
                              className={`${baseClass} bg-card/60 border-border text-muted-foreground`}
                              title="업로드 중..."
                            >
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span className="truncate">{item.name}</span>
                            </span>
                          );
                        }
                        if (item.status === 'error') {
                          return (
                            <span
                              key={item.id}
                              className={`${baseClass} bg-destructive/10 border-destructive/30 text-destructive`}
                              title={item.error || '업로드 실패'}
                            >
                              <TriangleAlert className="w-3.5 h-3.5" />
                              <span className="truncate">{item.name}</span>
                            </span>
                          );
                        }
                        return (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`${baseClass} bg-primary/10 border-primary/20 text-primary hover:bg-primary/15`}
                            title="클릭하면 파일을 엽니다"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="truncate">{item.name}</span>
                          </a>
                        );
                      })}
                      {attachmentItems.length > 8 ? (
                        <span className="text-[11px] text-muted-foreground self-center">
                          +{attachmentItems.length - 8}개
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div className="flex-1 min-h-[320px] bg-muted/50 border border-border rounded-xl overflow-hidden">
                  <KnowledgeEditor
                    editorRef={editorRef}
                    onHtmlChange={setNewContentHtml}
                    className="h-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 pt-4 border-t border-border flex-none bg-card/50 backdrop-blur-sm flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleProcessArticle}
                disabled={isProcessing || !newTitle.trim()}
                className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/30 transform active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{saveMode === 'ai' ? 'AI 분석 중...' : '저장 중...'}</span>
                  </>
                ) : (
                  <>
                    {saveMode === 'ai' ? <Sparkles className="w-4 h-4" /> : null}
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
              {/* Metadata Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${getCategoryInfo(selectedArticle.category).color}`}>
                    {getCategoryInfo(selectedArticle.category).icon} {getCategoryInfo(selectedArticle.category).label}
                  </span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(selectedArticle.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center text-muted-foreground font-bold text-[10px] ring-1 ring-border">
                      {selectedArticle.author[0]}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {selectedArticle.author}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleEditClick}
                    className="w-8 h-8 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10 flex items-center justify-center transition-all"
                    title="수정"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(selectedArticle)}
                    className="w-8 h-8 rounded-lg bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 flex items-center justify-center transition-all"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="text-3xl font-display font-bold text-foreground leading-tight">
                {selectedArticle.title}
              </h2>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-8 mb-4"></div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-8 space-y-8">
              {selectedArticle.structuredSummary && selectedArticle.structuredSummary.trim().length > 0 ? (
                <div className="px-8">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">📝</span>
                    요약 노트
                  </h3>
                  <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground pl-1">
                    <ReactMarkdown>{selectedArticle.structuredSummary}</ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {/* Raw Content Section */}
              <div className="px-8">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlignLeft className="w-3 h-3" /> 원본 내용
                </h3>
                <div
                  className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-img:rounded-lg prose-img:max-w-full pl-1"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(renderedHtml || selectedArticle.rawContent || ''),
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground relative z-10">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 opacity-20" />
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
              <TriangleAlert className="w-6 h-6 text-destructive" />
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
