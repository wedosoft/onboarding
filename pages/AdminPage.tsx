import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllProgress,
  getProgress,
  getProducts,
  getProgressSummary,
  listDocuments,
  deleteDocument,
  SessionSummary,
  DocumentInfo,
  UserProgress,
} from '../services/apiClient';
import { SCENARIOS } from '../constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '../components/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { ProgressSummary } from '../types';

type Tab = 'users' | 'documents';

// 사용자별 통합 데이터
interface UserSummary {
  userName: string;
  sessions: SessionSummary[];
  totalCompleted: number;
  completionRate: number;
  lastSessionId: string;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [deletingDocName, setDeletingDocName] = useState<string | null>(null);

  // 상세 모니터링(드릴다운)
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [scenarioProgress, setScenarioProgress] = useState<UserProgress | null>(null);
  const [curriculumSummaries, setCurriculumSummaries] = useState<
    Array<{ productId: string; productName: string; summary: ProgressSummary | null; error?: string }>
  >([]);

  const loadUserProgress = useCallback(async (force = false) => {
    if (!force && usersLoaded) return;
    setIsUsersLoading(true);
    try {
      const data = await getAllProgress();
      setSessions(data.sessions || []);
      setUsersLoaded(true);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    } finally {
      setIsUsersLoading(false);
    }
  }, [usersLoaded]);

  const loadDocuments = useCallback(async (force = false) => {
    if (!force && documentsLoaded) return;
    setIsDocumentsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      setDocumentsLoaded(true);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsDocumentsLoading(false);
    }
  }, [documentsLoaded]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUserProgress();
    } else {
      loadDocuments();
    }
  }, [activeTab, loadUserProgress, loadDocuments]);

  const handleDeleteDocument = async (docName: string, displayName: string) => {
    if (!confirm(`"${displayName}" 문서를 삭제하시겠습니까?`)) return;

    setDeletingDocName(docName);
    try {
      await deleteDocument(docName);
      await loadDocuments(true);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeletingDocName(null);
    }
  };

  const getMetadataValue = (doc: DocumentInfo, key: string): string => {
    const meta = doc.customMetadata?.find(m => m.key === key);
    return meta?.stringValue || '';
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('ko-KR');
  };

  const openUserDetail = async (user: UserSummary) => {
    setSelectedUser(user);
    setSelectedSessionId(user.lastSessionId);
    setIsDetailOpen(true);
  };

  const loadDetail = useCallback(async () => {
    if (!selectedSessionId) return;

    setDetailLoading(true);
    setDetailError(null);
    setScenarioProgress(null);
    setCurriculumSummaries([]);

    try {
      // 1) 시나리오 기반 온보딩 진행
      const scenarioPromise = getProgress(selectedSessionId);

      // 2) 커리큘럼 진행(제품별)
      const products = await getProducts();
      const productList = (products as any[])
        .map((p) => ({
          id: String(p.id),
          name: String(p.name || p.name_ko || p.id),
          isBundle: p.product_type === 'bundle',
        }))
        // 번들 상품은 개별 커리큘럼이 없을 수 있어 제외(필요하면 제거 가능)
        .filter((p) => !p.isBundle);

      const curriculumPromise = Promise.all(
        productList.map(async (p) => {
          try {
            const summary = await getProgressSummary(selectedSessionId, p.id);
            return { productId: p.id, productName: p.name, summary };
          } catch (e) {
            const msg = e instanceof Error ? e.message : '진도 조회 실패';
            return { productId: p.id, productName: p.name, summary: null, error: msg };
          }
        })
      );

      const [scenario, curriculum] = await Promise.all([scenarioPromise, curriculumPromise]);
      setScenarioProgress(scenario);
      // 완료율이 높은 제품부터 정렬
      setCurriculumSummaries(
        curriculum.sort((a, b) => (b.summary?.completionRate || 0) - (a.summary?.completionRate || 0))
      );
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : '상세 정보를 불러오지 못했습니다.');
    } finally {
      setDetailLoading(false);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (!isDetailOpen) return;
    loadDetail();
  }, [isDetailOpen, loadDetail]);

  // 사용자별로 세션 통합
  const userSummaries = useMemo(() => {
    const userMap = new Map<string, UserSummary>();

    sessions.forEach(session => {
      const userName = session.userName || '익명';

      if (userMap.has(userName)) {
        const existing = userMap.get(userName)!;
        existing.sessions.push(session);
        // 가장 높은 완료 수 사용
        if (session.completedCount > existing.totalCompleted) {
          existing.totalCompleted = session.completedCount;
          existing.completionRate = session.completionRate;
          existing.lastSessionId = session.sessionId;
        }
      } else {
        userMap.set(userName, {
          userName,
          sessions: [session],
          totalCompleted: session.completedCount,
          completionRate: session.completionRate,
          lastSessionId: session.sessionId,
        });
      }
    });

    return Array.from(userMap.values()).sort((a, b) => b.completionRate - a.completionRate);
  }, [sessions]);

  // Filter users by search
  const filteredUsers = userSummaries.filter(u =>
    u.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter documents by search
  const filteredDocuments = documents.filter(doc => {
    const displayName = doc.displayName?.toLowerCase() || '';
    const tags = getMetadataValue(doc, 'tags').toLowerCase();
    return displayName.includes(searchQuery.toLowerCase()) || tags.includes(searchQuery.toLowerCase());
  });

  const isTabLoading = activeTab === 'users' ? isUsersLoading : isDocumentsLoading;
  const handleRefresh = async () => {
    if (activeTab === 'users') {
      await loadUserProgress(true);
    } else {
      await loadDocuments(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Tabs */}
      <Card>
        <div className="border-b border-border">
          <nav className="flex">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium rounded-none ${activeTab === 'users'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
                }`}
            >
              <i className="fas fa-users mr-2" />
              사용자 진행 현황
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 text-sm font-medium rounded-none ${activeTab === 'documents'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
                }`}
            >
              <i className="fas fa-folder-open mr-2" />
              문서 관리
            </Button>
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder={activeTab === 'users' ? '사용자 검색...' : '문서 검색...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-md px-4 py-2 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
          />

          <div className="flex items-center gap-2">
            {isTabLoading && (sessions.length > 0 || documents.length > 0) ? (
              <span className="text-xs text-muted-foreground">동기화 중…</span>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isTabLoading}>
              새로고침
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent>
          {activeTab === 'users' ? (
            isUsersLoading && sessions.length === 0 ? (
              <div className="py-8 text-center">
                <LoadingSpinner message="사용자 진행 현황을 불러오는 중..." />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <i className="fas fa-users text-3xl mb-2" />
                <p>사용자 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border">
                      <th className="pb-3 font-medium">사용자</th>
                      <th className="pb-3 font-medium">완료 시나리오</th>
                      <th className="pb-3 font-medium">진행률</th>
                      <th className="pb-3 font-medium">상태</th>
                      <th className="pb-3 font-medium text-right">상세</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {user.userName[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.userName}
                              </p>
                              {user.sessions.length > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  {user.sessions.length}개 세션
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-foreground">
                          {user.totalCompleted} / {SCENARIOS.length}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={user.completionRate} className="w-24 h-2" />
                            <span className="text-foreground">
                              {user.completionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          {user.completionRate === 100 ? (
                            <Badge variant="default" className="bg-green-500/20 text-green-600 hover:bg-green-500/20 border border-green-500/30">
                              완료
                            </Badge>
                          ) : user.totalCompleted > 0 ? (
                            <Badge variant="default" className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/20 border border-blue-500/30">
                              진행 중
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              시작 전
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserDetail(user)}
                          >
                            상세보기
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            isDocumentsLoading && documents.length === 0 ? (
              <div className="py-8 text-center">
                <LoadingSpinner message="문서 목록을 불러오는 중..." />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <i className="fas fa-folder-open text-3xl mb-2" />
                <p>문서가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => {
                  const category = getMetadataValue(doc, 'category');
                  const author = getMetadataValue(doc, 'author');
                  const tags = getMetadataValue(doc, 'tags');

                  return (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-border">
                          <i className="fas fa-file-alt text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {doc.displayName || doc.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {category && <span className="capitalize">{category}</span>}
                            {author && <span>by {author}</span>}
                            {tags && <span>#{tags.split(',')[0]}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.name, doc.displayName || doc.name)}
                        disabled={deletingDocName === doc.name}
                        aria-label={`${doc.displayName || doc.name} 문서 삭제`}
                        title="삭제"
                      >
                        <i className="fas fa-trash" />
                        {deletingDocName === doc.name ? '삭제 중…' : '삭제'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* 상세 모니터링 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>사용자 진행 현황 상세</DialogTitle>
            <DialogDescription>
              시나리오(온보딩)와 커리큘럼(모듈) 진행 상태를 세션 기준으로 확인합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">사용자</div>
                <div className="text-base font-semibold text-foreground">{selectedUser?.userName || '-'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">세션</div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="h-9 px-3 bg-muted border border-input rounded-md text-sm"
                  >
                    {(selectedUser?.sessions || []).map((s) => (
                      <option key={s.sessionId} value={s.sessionId}>
                        {s.sessionId.slice(0, 8)}… ({formatDateTime(s.lastActivity)})
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={loadDetail} disabled={detailLoading}>
                    새로고침
                  </Button>
                </div>
              </div>
            </div>

            {detailError && (
              <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-sm text-destructive">
                {detailError}
              </div>
            )}

            {detailLoading ? (
              <div className="py-10 text-center">
                <LoadingSpinner />
                <p className="mt-2 text-muted-foreground">상세 데이터를 불러오는 중...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 시나리오 진행 */}
                <Card className="h-fit">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">온보딩 시나리오</h3>
                      <Badge variant="outline">세션 기준</Badge>
                    </div>

                    {scenarioProgress ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">완료</span>
                          <span className="text-foreground font-medium">
                            {scenarioProgress.completedScenarios.length} / {scenarioProgress.totalScenarios}
                          </span>
                        </div>
                        <Progress value={scenarioProgress.completionRate} className="h-2" />
                        <div className="text-sm text-muted-foreground">
                          진행률: <span className="text-foreground font-medium">{Math.round(scenarioProgress.completionRate)}%</span>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="scenarios">
                            <AccordionTrigger>
                              완료한 시나리오 목록 ({scenarioProgress.completedScenarios.length})
                            </AccordionTrigger>
                            <AccordionContent>
                              {scenarioProgress.completedScenarios.length === 0 ? (
                                <div className="text-sm text-muted-foreground">아직 완료한 시나리오가 없습니다.</div>
                              ) : (
                                <div className="space-y-2">
                                  {[...scenarioProgress.completedScenarios]
                                    .slice()
                                    .sort((a, b) => (a.completedAt > b.completedAt ? -1 : 1))
                                    .map((r) => {
                                      const scenario = SCENARIOS.find((s) => s.id === r.scenarioId);
                                      return (
                                        <div key={r.scenarioId} className="flex items-start justify-between gap-3 p-2 rounded-md bg-muted/40 border border-border">
                                          <div className="min-w-0">
                                            <div className="text-sm font-medium text-foreground truncate">
                                              {scenario?.title || r.scenarioId}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{r.scenarioId}</div>
                                          </div>
                                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(r.completedAt)}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">시나리오 진행 정보를 불러오지 못했습니다.</div>
                    )}
                  </CardContent>
                </Card>

                {/* 커리큘럼 진행 */}
                <Card className="h-fit">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">커리큘럼(모듈) 진행</h3>
                      <Badge variant="outline">제품별</Badge>
                    </div>

                    {curriculumSummaries.length === 0 ? (
                      <div className="text-sm text-muted-foreground">커리큘럼 진도 데이터가 없습니다.</div>
                    ) : (
                      <Accordion type="single" collapsible className="w-full">
                        {curriculumSummaries.map((p) => {
                          const rate = p.summary?.completionRate || 0;
                          const completed = p.summary?.completedModules || 0;
                          const total = p.summary?.totalModules || 0;

                          return (
                            <AccordionItem key={p.productId} value={p.productId}>
                              <AccordionTrigger>
                                <div className="flex items-center justify-between w-full pr-3">
                                  <div className="min-w-0">
                                    <div className="font-medium text-foreground truncate">{p.productName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{p.productId}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                      {completed}/{total}
                                    </div>
                                    <div className="w-28">
                                      <Progress value={rate} className="h-2" />
                                    </div>
                                    <div className="text-sm font-medium text-foreground whitespace-nowrap">
                                      {Math.round(rate)}%
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                {p.error && (
                                  <div className="mb-3 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                                    {p.error}
                                  </div>
                                )}

                                {!p.summary ? (
                                  <div className="text-sm text-muted-foreground">요약 데이터를 불러오지 못했습니다.</div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                      <div className="p-3 rounded-md bg-muted/40 border border-border">
                                        <div className="text-xs text-muted-foreground">완료</div>
                                        <div className="text-lg font-semibold text-foreground">{p.summary.completedModules}</div>
                                      </div>
                                      <div className="p-3 rounded-md bg-muted/40 border border-border">
                                        <div className="text-xs text-muted-foreground">진행 중</div>
                                        <div className="text-lg font-semibold text-foreground">{p.summary.inProgressModules}</div>
                                      </div>
                                      <div className="p-3 rounded-md bg-muted/40 border border-border">
                                        <div className="text-xs text-muted-foreground">전체 모듈</div>
                                        <div className="text-lg font-semibold text-foreground">{p.summary.totalModules}</div>
                                      </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="text-left text-xs text-muted-foreground border-b border-border">
                                            <th className="py-2 font-medium">모듈</th>
                                            <th className="py-2 font-medium">상태</th>
                                            <th className="py-2 font-medium">점수</th>
                                            <th className="py-2 font-medium">시도</th>
                                            <th className="py-2 font-medium">완료일</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {p.summary.modules.map((m) => (
                                            <tr key={m.id}>
                                              <td className="py-2">
                                                <div className="font-medium text-foreground">{m.nameKo}</div>
                                                <div className="text-xs text-muted-foreground">{m.slug}</div>
                                              </td>
                                              <td className="py-2">
                                                {m.status === 'completed' ? (
                                                  <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/20 border border-green-500/30">완료</Badge>
                                                ) : m.status === 'learning' ? (
                                                  <Badge className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/20 border border-blue-500/30">진행</Badge>
                                                ) : (
                                                  <Badge variant="secondary">미시작</Badge>
                                                )}
                                              </td>
                                              <td className="py-2 text-foreground">{m.quizScore ?? '-'}</td>
                                              <td className="py-2 text-foreground">{m.quizAttempts ?? '-'}</td>
                                              <td className="py-2 text-muted-foreground">{formatDateTime(m.completedAt)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
