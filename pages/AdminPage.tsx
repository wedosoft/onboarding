import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllProgress, listDocuments, deleteDocument, SessionSummary, DocumentInfo } from '../services/apiClient';
import { SCENARIOS } from '../constants';

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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUserProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllProgress();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUserProgress();
    } else {
      loadDocuments();
    }
  }, [activeTab, loadUserProgress, loadDocuments]);

  const handleDeleteDocument = async (docName: string, displayName: string) => {
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

  // Stats calculation (사용자 기준)
  const totalUsers = userSummaries.length;
  const activeUsers = userSummaries.filter(u => u.totalCompleted > 0).length;
  const avgCompletion = userSummaries.length > 0
    ? Math.round(userSummaries.reduce((sum, u) => sum + u.completionRate, 0) / userSummaries.length)
    : 0;
  const totalDocuments = documents.length;

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-700">{totalUsers}</p>
              <p className="text-sm text-slate-500">전체 사용자</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-check text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-700">{activeUsers}</p>
              <p className="text-sm text-slate-500">활성 사용자</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-700">{avgCompletion}%</p>
              <p className="text-sm text-slate-500">평균 진행률</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-700">{totalDocuments}</p>
              <p className="text-sm text-slate-500">문서 수</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'users'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              <i className="fas fa-users mr-2" />
              사용자 진행 현황
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'documents'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              <i className="fas fa-folder-open mr-2" />
              문서 관리
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            placeholder={activeTab === 'users' ? '사용자 검색...' : '문서 검색...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-2 text-slate-500">로딩 중...</p>
            </div>
          ) : activeTab === 'users' ? (
            /* Users Tab */
            filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <i className="fas fa-users text-3xl mb-2" />
                <p>사용자 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500 border-b border-slate-200">
                      <th className="pb-3 font-medium">사용자</th>
                      <th className="pb-3 font-medium">완료 시나리오</th>
                      <th className="pb-3 font-medium">진행률</th>
                      <th className="pb-3 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                              {user.userName[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-700">
                                {user.userName}
                              </p>
                              {user.sessions.length > 1 && (
                                <p className="text-xs text-slate-500">
                                  {user.sessions.length}개 세션
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">
                          {user.totalCompleted} / {SCENARIOS.length}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${user.completionRate}%` }}
                              />
                            </div>
                            <span className="text-slate-600">
                              {user.completionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          {user.completionRate === 100 ? (
                            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-600 rounded-full border border-green-500/30">
                              완료
                            </span>
                          ) : user.totalCompleted > 0 ? (
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-600 rounded-full border border-blue-500/30">
                              진행 중
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-slate-200 text-slate-500 rounded-full border border-slate-300">
                              시작 전
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Documents Tab */
            filteredDocuments.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
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
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                          <i className="fas fa-file-alt text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-700 truncate">
                            {doc.displayName || doc.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {category && <span className="capitalize">{category}</span>}
                            {author && <span>by {author}</span>}
                            {tags && <span>#{tags.split(',')[0]}</span>}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.name, doc.displayName || doc.name)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
