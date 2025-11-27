/**
 * AI 멘토 서비스 (백엔드 API 사용)
 * 
 * 기존 Gemini 직접 호출을 agent-platform 백엔드 API로 대체
 */

import { Scenario, Choice } from '../types';
import { 
  createSession, 
  streamChat, 
  streamFeedback, 
  streamFollowUp,
  saveProgress,
} from './apiClient';

// 현재 세션 정보
let currentSessionId: string | null = null;
let currentUserName: string = '신입사원';

/**
 * 멘토 세션 초기화
 */
export async function initializeMentorSession(userName: string): Promise<void> {
  currentUserName = userName;
  
  try {
    const response = await createSession(userName);
    currentSessionId = response.sessionId;
    console.log(`[MentorService] Session created: ${currentSessionId}`);
  } catch (error) {
    console.error('[MentorService] Failed to create session:', error);
    // 폴백: 로컬 세션 ID 생성
    currentSessionId = `local-${Date.now()}`;
  }
}

/**
 * 세션 ID 가져오기
 */
export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `local-${Date.now()}`;
  }
  return currentSessionId;
}

/**
 * 채팅 응답 스트리밍 (AI 멘토)
 */
export async function* getChatResponseStream(
  message: string
): AsyncGenerator<{ text: string }> {
  const sessionId = getSessionId();
  
  try {
    for await (const event of streamChat(sessionId, message)) {
      if (event.event === 'chunk' && event.data.text) {
        yield { text: event.data.text };
      } else if (event.event === 'error') {
        throw new Error(event.data.message || 'Chat error');
      }
    }
  } catch (error) {
    console.error('[MentorService] Chat stream error:', error);
    throw new Error('AI 멘토로부터 답변을 가져오는 데 실패했습니다.');
  }
}

/**
 * 시나리오 피드백 스트리밍
 */
export async function* getFeedbackStream(
  scenario: Scenario,
  userChoice: Choice
): AsyncGenerator<{ text: string }> {
  const sessionId = getSessionId();
  
  try {
    for await (const event of streamFeedback({
      sessionId,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scenarioDescription: scenario.description,
      allChoices: scenario.choices.map(c => c.text),
      selectedChoice: userChoice.text,
      userName: currentUserName,
    })) {
      if (event.event === 'feedback_chunk' && event.data.text) {
        yield { text: event.data.text };
      } else if (event.event === 'questions' && event.data.questions) {
        // 질문 구분자와 함께 전송
        const questionsText = '\n%%%QUESTIONS%%%\n' + event.data.questions.join('\n');
        yield { text: questionsText };
      } else if (event.event === 'error') {
        throw new Error(event.data.message || 'Feedback error');
      }
    }
    
    // 진행도 저장
    try {
      await saveProgress(sessionId, scenario.id, userChoice.id);
    } catch (e) {
      console.warn('[MentorService] Failed to save progress:', e);
    }
    
  } catch (error) {
    console.error('[MentorService] Feedback stream error:', error);
    throw new Error('AI로부터 피드백을 가져오는 데 실패했습니다.');
  }
}

/**
 * 후속 질문 답변 스트리밍
 */
export async function* getFollowUpAnswerStream(
  scenario: Scenario,
  originalFeedback: string,
  question: string
): AsyncGenerator<{ text: string }> {
  const sessionId = getSessionId();
  
  try {
    for await (const event of streamFollowUp({
      sessionId,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scenarioDescription: scenario.description,
      originalFeedback,
      question,
      userName: currentUserName,
    })) {
      if (event.event === 'chunk' && event.data.text) {
        yield { text: event.data.text };
      } else if (event.event === 'error') {
        throw new Error(event.data.message || 'Follow-up error');
      }
    }
  } catch (error) {
    console.error('[MentorService] Follow-up stream error:', error);
    throw new Error('AI 멘토로부터 추가 답변을 가져오는 데 실패했습니다.');
  }
}