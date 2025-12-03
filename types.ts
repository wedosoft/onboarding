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

// ============================================
// 커리큘럼 모듈 (Curriculum Module)
// ============================================

export interface CurriculumModule {
  id: string;
  product: string;
  nameKo: string;
  nameEn?: string;
  slug: string;
  description?: string;
  icon?: string;
  estimatedMinutes: number;
  displayOrder: number;
  
  // 진도 정보
  isUnlocked: boolean;
  status: 'not_started' | 'learning' | 'quiz_ready' | 'completed';
  basicQuizPassed: boolean;
  advancedQuizPassed: boolean;
  basicQuizScore?: number;
  advancedQuizScore?: number;
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  moduleId: string;
  difficulty: 'basic' | 'advanced';
  questionOrder: number;
  question: string;
  context?: string;
  choices: QuizChoice[];
  kbDocumentId?: string;
  referenceUrl?: string;
}

export interface QuizAnswer {
  questionId: string;
  choiceId: string;
}

export interface QuizAnswerResult {
  questionId: string;
  choiceId: string;
  isCorrect: boolean;
  correctChoiceId: string;
  explanation?: string;
}

export interface QuizSubmitRequest {
  sessionId: string;
  moduleId: string;
  difficulty: 'basic' | 'advanced';
  answers: QuizAnswer[];
  startedAt?: string;
}

export interface QuizSubmitResponse {
  moduleId: string;
  difficulty: 'basic' | 'advanced';
  score: number;
  totalQuestions: number;
  correctCount: number;
  isPassed: boolean;
  passingScore: number;
  answers: QuizAnswerResult[];
  durationSeconds?: number;
}

export interface ModuleProgress {
  id?: string;
  sessionId: string;
  moduleId: string;
  status: 'not_started' | 'learning' | 'quiz_ready' | 'completed';
  
  learningStartedAt?: string;
  learningCompletedAt?: string;
  
  basicQuizScore?: number;
  basicQuizPassed: boolean;
  basicQuizAttempts: number;
  
  advancedQuizScore?: number;
  advancedQuizPassed: boolean;
  advancedQuizAttempts: number;
  
  completedAt?: string;
}

export interface ProgressSummary {
  sessionId: string;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  completionRate: number;
  modules: CurriculumModule[];
}

// ============================================
// 제품별 지식 학습 (Product Knowledge)
// ============================================

export interface Product {
  id: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  icon: string;
  color: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameEn: string;
  nameKo: string | null;
  slug: string;
  description: string | null;
  displayOrder: number;
}

export interface ProductFolder {
  id: string;
  name: string;
  nameEn: string;
  nameKo: string | null;
  slug: string;
  displayOrder: number;
}

export interface ProductDocument {
  id: string;
  csvId: number;
  title: string;
  titleEn: string;
  titleKo: string | null;
  slug: string;
  folderId: string | null;
}

export interface ProductStats {
  product_id: string;
  category_count: number;
  document_count: number;
}
