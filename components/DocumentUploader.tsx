import React, { useState, useRef } from 'react';
import { uploadDocument, listDocuments, deleteDocument, type DocumentInfo } from '../services/apiClient';

interface DocumentUploaderProps {
  onUploadComplete?: (doc: DocumentInfo) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DocumentInfo | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<'handover' | 'process'>('handover');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !author.trim()) {
      setUploadError('파일과 작성자를 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const metadata = [
        { key: 'category', stringValue: category },
        { key: 'author', stringValue: author.trim() },
      ];

      if (tags) {
        metadata.push({ key: 'tags', stringValue: tags });
      }

      const result = await uploadDocument({
        file: selectedFile,
        metadata,
      });

      setUploadSuccess(`"${result.displayName}" 문서가 업로드되었습니다.`);
      setSelectedFile(null);
      setAuthor('');
      setTags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onUploadComplete?.(result);
      loadDocuments();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    loadDocuments();
  };

  const handleDeleteClick = (doc: DocumentInfo) => {
    setDeleteConfirm(doc);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(deleteConfirm.name);
    try {
      await deleteDocument(deleteConfirm.name);
      setUploadSuccess(`"${deleteConfirm.displayName}" 문서가 삭제되었습니다.`);
      setDeleteConfirm(null);
      loadDocuments();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const categoryLabels = {
    handover: '인수인계',
    process: '업무 프로세스',
    product: '제품 지식',
  };

  return (
    <>
      {/* 삭제 확인 다이얼로그 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="glass-card bg-card rounded-xl shadow-2xl w-full max-w-md p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">문서 삭제 확인</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              <span className="text-foreground font-medium">"{deleteConfirm.displayName}"</span> 문서를 삭제하시겠습니까?
              <br />
              <span className="text-red-400 text-sm">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting !== null}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-200 hover:scale-110 z-40 border border-primary/50"
        title="문서 업로드"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </button>

      {/* 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="glass-card bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-border">
            {/* 헤더 */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                인수인계 문서 관리
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 업로드 폼 */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-4 border border-border">
                <h3 className="text-sm font-medium text-foreground">새 문서 업로드</h3>

                {/* 파일 선택 */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted transition-all"
                  >
                    {selectedFile ? (
                      <span className="text-primary">{selectedFile.name}</span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-muted-foreground">파일을 선택하세요 (.txt, .md, .pdf)</span>
                      </>
                    )}
                  </label>
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'handover' | 'process')}
                    className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="handover">📋 인수인계</option>
                    <option value="process">📝 업무 프로세스</option>
                  </select>
                </div>

                {/* 작성자 */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">작성자 *</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="예: 김과장"
                    className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-muted-foreground"
                  />
                </div>

                {/* 태그 */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">태그 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="예: A거래처, 영업, 계약"
                    className="w-full bg-card border border-border text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-muted-foreground"
                  />
                </div>

                {/* 에러/성공 메시지 */}
                {uploadError && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    ❌ {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                    ✅ {uploadSuccess}
                  </div>
                )}

                {/* 업로드 버튼 */}
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      문서 업로드
                    </>
                  )}
                </button>
              </div>

              {/* 업로드된 문서 목록 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  업로드된 문서 ({documents.length})
                </h3>

                {isLoadingDocs ? (
                  <div className="text-center text-muted-foreground py-4">
                    <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    문서 목록 로딩 중...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 bg-muted/30 rounded-lg border border-border">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    아직 업로드된 문서가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group border border-border"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-muted-foreground text-sm truncate flex-1">
                          {doc.displayName}
                        </span>
                        <button
                          onClick={() => handleDeleteClick(doc)}
                          disabled={isDeleting === doc.name}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1 rounded hover:bg-red-500/10 disabled:opacity-50"
                          title="삭제"
                        >
                          {isDeleting === doc.name ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentUploader;
