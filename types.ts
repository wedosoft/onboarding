export interface Choice {
  id: string;
  text: string;
}

export interface Scenario {
  id: string;
  title: string;
  icon: string; // Font Awesome icon class, e.g., 'fa-tasks'
  description: string;
  choices: Choice[];
  category: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface FeedbackData {
  feedback: string;
  followUpQuestions: string[];
}

// ============================================
// Assessment (학습 평가) 타입
// ============================================

export interface AssessmentTrack {
  id: string;
  name: string;  // '업무 센스 체크' | '제품 지식'
  description: string;
  icon: string;
  type: 'work_sense' | 'product_knowledge';
  totalLevels?: number;  // 제품 지식만 해당
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
  context?: string;  // 시나리오 배경
  choices: AssessmentChoice[];
}

export interface AssessmentChoice {
  id: string;
  text: string;
}

export interface AssessmentAnswer {
  questionId: string;
  choiceId: string;
  isCorrect?: boolean;
  explanation?: string;
}

export interface AssessmentProgress {
  trackId: string;
  levelId?: string;
  completedQuestions: number;
  totalQuestions: number;
  score: number;
  isPassed: boolean;
  completedAt?: string;
}
