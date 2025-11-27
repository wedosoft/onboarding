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
