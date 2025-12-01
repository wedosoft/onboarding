/**
 * Agent Platform 백엔드 API 클라이언트
 * Gemini 직접 호출 대신 백엔드를 통해 안전하게 AI 기능 사용
 */

import { getAccessToken } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiError {
  message: string;
  status: number;
}

class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiClientError';
  }
}

/**
 * 인증 헤더 가져오기
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const authHeaders = await getAuthHeaders();
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiClientError(
      errorData.detail?.message || errorData.detail || errorData.message || 'API Error',
      response.status
    );
  }

  return response.json();
}

// ============================================
// 세션 관리
// ============================================

export interface CreateSessionResponse {
  sessionId: string;
  message?: string;
}

export async function createSession(userName: string): Promise<CreateSessionResponse> {
  return apiFetch<CreateSessionResponse>('/onboarding/session', {
    method: 'POST',
    body: JSON.stringify({ userName }),
  });
}

// ============================================
// 채팅 (스트리밍)
// ============================================

export interface ChatStreamEvent {
  event: 'chunk' | 'result' | 'error';
  data: {
    text?: string;
    message?: string;
  };
}

export async function* streamChat(
  sessionId: string,
  message: string
): AsyncGenerator<ChatStreamEvent> {
  const url = `${API_BASE_URL}/onboarding/chat/stream?sessionId=${encodeURIComponent(sessionId)}&query=${encodeURIComponent(message)}`;

  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...authHeaders,
    },
  });
  
  if (!response.ok) {
    throw new ApiClientError('Chat stream failed', response.status);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiClientError('No response body', 500);
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        const eventType = line.slice(7).trim();
        continue;
      }
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield { event: data.event || 'chunk', data };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// ============================================
// 시나리오 피드백 (스트리밍)
// ============================================

export interface FeedbackRequest {
  sessionId: string;
  scenarioId: string;
  scenarioTitle: string;
  scenarioDescription: string;
  allChoices: string[];
  selectedChoice: string;
  userName: string;
}

export interface FeedbackStreamEvent {
  event: 'feedback_chunk' | 'questions' | 'result' | 'error';
  data: {
    text?: string;
    questions?: string[];
    message?: string;
  };
}

export async function* streamFeedback(
  request: FeedbackRequest
): AsyncGenerator<FeedbackStreamEvent> {
  const params = new URLSearchParams({
    sessionId: request.sessionId,
    scenarioId: request.scenarioId,
    scenarioTitle: request.scenarioTitle,
    scenarioDescription: request.scenarioDescription,
    selectedChoice: request.selectedChoice,
    userName: request.userName,
  });
  
  // 배열 파라미터 추가
  request.allChoices.forEach(choice => {
    params.append('allChoices', choice);
  });
  
  const url = `${API_BASE_URL}/onboarding/feedback/stream?${params.toString()}`;

  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...authHeaders,
    },
  });
  
  if (!response.ok) {
    throw new ApiClientError('Feedback stream failed', response.status);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiClientError('No response body', 500);
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield { event: data.event || 'feedback_chunk', data };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// ============================================
// 후속 질문 답변 (스트리밍)
// ============================================

export interface FollowUpRequest {
  sessionId: string;
  scenarioId: string;
  scenarioTitle: string;
  scenarioDescription: string;
  originalFeedback: string;
  question: string;
  userName: string;
}

export async function* streamFollowUp(
  request: FollowUpRequest
): AsyncGenerator<ChatStreamEvent> {
  const params = new URLSearchParams({
    sessionId: request.sessionId,
    scenarioId: request.scenarioId,
    scenarioTitle: request.scenarioTitle,
    scenarioDescription: request.scenarioDescription,
    originalFeedback: request.originalFeedback,
    question: request.question,
    userName: request.userName,
  });
  
  const url = `${API_BASE_URL}/onboarding/followup/stream?${params.toString()}`;

  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...authHeaders,
    },
  });
  
  if (!response.ok) {
    throw new ApiClientError('Follow-up stream failed', response.status);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiClientError('No response body', 500);
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield { event: data.event || 'chunk', data };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// ============================================
// 진행도 관리
// ============================================

export interface ProgressRecord {
  scenarioId: string;
  completedAt: string;
  choiceId: string;
  feedbackRating?: number;
}

export interface UserProgress {
  userId: string;
  userName: string;
  completedScenarios: ProgressRecord[];
  totalScenarios: number;
  completionRate: number;
}

export async function saveProgress(
  sessionId: string,
  scenarioId: string,
  choiceId: string,
  feedbackRating?: number
): Promise<{ success: boolean }> {
  return apiFetch('/onboarding/progress', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      scenarioId,
      choiceId,
      feedbackRating,
    }),
  });
}

export async function getProgress(sessionId: string): Promise<UserProgress> {
  return apiFetch(`/onboarding/progress/${encodeURIComponent(sessionId)}`);
}

// ============================================
// 문서 업로드 (인수인계 문서)
// ============================================

export interface UploadDocumentRequest {
  file: File;
  metadata?: Array<{ key: string; stringValue: string }>;
}

export interface DocumentMetadata {
  key: string;
  stringValue: string;
}

export interface DocumentInfo {
  name: string;
  displayName: string;
  customMetadata?: DocumentMetadata[];
}

export async function uploadDocument(
  request: UploadDocumentRequest
): Promise<DocumentInfo> {
  const formData = new FormData();
  formData.append('file', request.file);

  if (request.metadata) {
    formData.append('metadata', JSON.stringify(request.metadata));
  }

  const authHeaders = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/onboarding/documents`,
    {
      method: 'POST',
      body: formData,
      headers: authHeaders,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new ApiClientError(error.detail || 'Upload failed', response.status);
  }

  return response.json();
}

export async function listDocuments(category?: string): Promise<DocumentInfo[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch(`/onboarding/documents${params}`);
}

export async function deleteDocument(documentName: string): Promise<{ success: boolean }> {
  return apiFetch(`/onboarding/documents/${encodeURIComponent(documentName)}`, {
    method: 'DELETE',
  });
}

// ============================================
// 관리자 API
// ============================================

export interface SessionSummary {
  sessionId: string;
  userName: string;
  completedCount: number;
  totalScenarios: number;
  completionRate: number;
  lastActivity?: string;
}

export interface AllSessionsResponse {
  sessions: SessionSummary[];
}

export async function getAllProgress(): Promise<AllSessionsResponse> {
  return apiFetch('/onboarding/progress');
}

// ============================================
// 지식 베이스 (Knowledge Base)
// ============================================

export interface KnowledgeArticle {
  id: string;
  title: string;
  author: string;
  category: string;  // handover, process, tips, company, tools, etc
  rawContent: string;
  structuredSummary?: string;
  createdAt: string;
}

export interface CreateKnowledgeArticleRequest {
  title: string;
  author: string;
  category: string;
  rawContent: string;
  structuredSummary: string;
}

/**
 * AI를 사용하여 지식 콘텐츠 구조화
 */
export async function structureKnowledge(rawContent: string, category: string): Promise<string> {
  const result = await apiFetch<{ structuredSummary: string }>('/onboarding/knowledge/structure', {
    method: 'POST',
    body: JSON.stringify({ rawContent, category }),
  });
  return result.structuredSummary;
}

/**
 * 지식 아티클 목록 조회
 */
export async function getKnowledgeArticles(category?: string): Promise<KnowledgeArticle[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch<KnowledgeArticle[]>(`/onboarding/knowledge${params}`);
}

/**
 * 지식 아티클 생성
 */
export async function createKnowledgeArticle(request: CreateKnowledgeArticleRequest): Promise<KnowledgeArticle> {
  return apiFetch<KnowledgeArticle>('/onboarding/knowledge', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 지식 아티클 삭제
 */
export async function deleteKnowledgeArticle(articleId: string): Promise<{ success: boolean }> {
  return apiFetch(`/onboarding/knowledge/${encodeURIComponent(articleId)}`, {
    method: 'DELETE',
  });
}

// ============================================
// 학습 평가 (Assessment)
// ============================================

export interface AssessmentTrack {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'work_sense' | 'product_knowledge';
  totalLevels?: number;
}

export interface AssessmentLevel {
  id: string;
  trackId: string;
  order: number;
  name: string;
  description: string;
  passingScore: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  score?: number;
}

export interface AssessmentQuestion {
  id: string;
  trackId: string;
  levelId?: string;
  type: 'multiple_choice' | 'scenario';
  question: string;
  context?: string;
  choices: { id: string; text: string }[];
}

export interface AssessmentSubmitRequest {
  sessionId: string;
  trackId: string;
  levelId?: string;
  answers: { questionId: string; choiceId: string }[];
}

export interface AssessmentResult {
  trackId: string;
  levelId?: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  isPassed: boolean;
  answers: {
    questionId: string;
    choiceId: string;
    isCorrect: boolean;
    correctChoiceId: string;
    explanation: string;
  }[];
}

/**
 * 트랙 목록 조회
 */
export async function getAssessmentTracks(): Promise<AssessmentTrack[]> {
  return apiFetch<AssessmentTrack[]>('/onboarding/assessment/tracks');
}

/**
 * 트랙의 레벨 목록 조회 (제품 지식용)
 */
export async function getAssessmentLevels(trackId: string, sessionId: string): Promise<AssessmentLevel[]> {
  return apiFetch<AssessmentLevel[]>(
    `/onboarding/assessment/tracks/${encodeURIComponent(trackId)}/levels?sessionId=${encodeURIComponent(sessionId)}`
  );
}

/**
 * 학습 콘텐츠 스트리밍 조회 (RAG 기반)
 */
export async function* streamLearningContent(
  trackId: string,
  levelId: string
): AsyncGenerator<ChatStreamEvent> {
  const url = `${API_BASE_URL}/onboarding/assessment/learn/${encodeURIComponent(trackId)}/${encodeURIComponent(levelId)}/stream`;

  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    throw new ApiClientError('Learning content stream failed', response.status);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiClientError('No response body', 500);
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield { event: data.event || 'chunk', data };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * AI 멘토 채팅 스트리밍
 */
export async function* streamMentorChat(
  sessionId: string,
  trackId: string,
  levelId: string,
  message: string
): AsyncGenerator<ChatStreamEvent> {
  const params = new URLSearchParams({
    sessionId,
    trackId,
    levelId,
    message,
  });

  const url = `${API_BASE_URL}/onboarding/assessment/mentor/chat/stream?${params.toString()}`;

  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    throw new ApiClientError('Mentor chat stream failed', response.status);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiClientError('No response body', 500);
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield { event: data.event || 'chunk', data };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * 퀴즈 문제 조회
 */
export async function getAssessmentQuestions(
  trackId: string,
  levelId?: string
): Promise<AssessmentQuestion[]> {
  const params = levelId ? `?levelId=${encodeURIComponent(levelId)}` : '';
  return apiFetch<AssessmentQuestion[]>(
    `/onboarding/assessment/questions/${encodeURIComponent(trackId)}${params}`
  );
}

/**
 * 퀴즈 답안 제출
 */
export async function submitAssessment(request: AssessmentSubmitRequest): Promise<AssessmentResult> {
  return apiFetch<AssessmentResult>('/onboarding/assessment/submit', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 진행도 조회
 */
export async function getAssessmentProgress(sessionId: string): Promise<{
  tracks: {
    trackId: string;
    levelId?: string;
    score: number;
    isPassed: boolean;
    completedAt: string;
  }[];
}> {
  return apiFetch(`/onboarding/assessment/progress/${encodeURIComponent(sessionId)}`);
}

// ============================================
// 제품별 지식 학습 (Product Knowledge) API
// ============================================

import type {
  Product,
  ProductCategory,
  ProductFolder,
  ProductDocument,
  ProductStats,
} from '../types';

/**
 * 지원 제품 목록 조회
 */
export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/onboarding/products');
}

/**
 * 단일 제품 정보 조회
 */
export async function getProduct(productId: string): Promise<Product> {
  return apiFetch<Product>(`/onboarding/products/${encodeURIComponent(productId)}`);
}

/**
 * 제품별 카테고리 목록 조회
 */
export async function getProductCategories(productId: string): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>(
    `/onboarding/products/${encodeURIComponent(productId)}/categories`
  );
}

/**
 * 단일 카테고리 정보 조회
 */
export async function getProductCategory(
  productId: string,
  categorySlug: string
): Promise<ProductCategory> {
  return apiFetch<ProductCategory>(
    `/onboarding/products/${encodeURIComponent(productId)}/categories/${encodeURIComponent(categorySlug)}`
  );
}

/**
 * 카테고리 내 폴더 목록 조회
 */
export async function getCategoryFolders(
  productId: string,
  categorySlug: string
): Promise<ProductFolder[]> {
  return apiFetch<ProductFolder[]>(
    `/onboarding/products/${encodeURIComponent(productId)}/categories/${encodeURIComponent(categorySlug)}/folders`
  );
}

/**
 * 카테고리 내 문서 목록 조회
 */
export async function getCategoryDocuments(
  productId: string,
  categorySlug: string,
  limit: number = 50
): Promise<ProductDocument[]> {
  return apiFetch<ProductDocument[]>(
    `/onboarding/products/${encodeURIComponent(productId)}/categories/${encodeURIComponent(categorySlug)}/documents?limit=${limit}`
  );
}

/**
 * 제품별 문서 통계 조회
 */
export async function getProductStats(productId: string): Promise<ProductStats> {
  return apiFetch<ProductStats>(
    `/onboarding/products/${encodeURIComponent(productId)}/stats`
  );
}

/**
 * 카테고리별 학습 콘텐츠 스트리밍
 */
export async function* streamCategoryLearning(
  productId: string,
  categorySlug: string
): AsyncGenerator<ChatStreamEvent> {
  const url = `${API_BASE_URL}/onboarding/products/${encodeURIComponent(productId)}/categories/${encodeURIComponent(categorySlug)}/learn/stream`;

  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    throw new ApiClientError('Failed to stream learning content', response.status);
  }

  if (!response.body) {
    throw new ApiClientError('No response body', 500);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield { event: data.event || 'chunk', data };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * 제품별 AI 채팅 스트리밍
 */
export async function* streamProductChat(
  productId: string,
  message: string,
  options?: {
    sessionId?: string;
    categorySlug?: string;
  }
): AsyncGenerator<ChatStreamEvent> {
  const params = new URLSearchParams({ message });
  if (options?.sessionId) {
    params.append('sessionId', options.sessionId);
  }
  if (options?.categorySlug) {
    params.append('categorySlug', options.categorySlug);
  }

  const url = `${API_BASE_URL}/onboarding/products/${encodeURIComponent(productId)}/chat/stream?${params.toString()}`;

  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    throw new ApiClientError('Failed to stream chat', response.status);
  }

  if (!response.body) {
    throw new ApiClientError('No response body', 500);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield { event: data.event || 'chunk', data };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}
