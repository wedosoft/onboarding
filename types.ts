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
// 커리큘럼 모듈 (Curriculum Module)
// ============================================

export interface CurriculumModule {
  id: string;
  targetProductId: string;
  targetProductType: string;
  targetProductName?: string;
  nameKo: string;
  nameEn?: string;
  slug: string;
  description?: string;
  icon?: string;
  estimatedMinutes: number;
  displayOrder: number;
  learningObjectives?: string[];
  contentStrategy?: string;
  kbCategorySlug?: string;
  isActive: boolean;
  createdAt?: string;
  
  // 진도 정보 (join된 경우)
  status?: 'not_started' | 'learning' | 'completed';
  quizScore?: number;
  quizAttempts?: number;
  completedAt?: string;
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
  answers: QuizAnswer[];
  startedAt?: string;
}

export interface QuizSubmitResponse {
  moduleId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  answers: QuizAnswerResult[];
  durationSeconds?: number;
  feedback?: string;
}

export interface ModuleProgress {
  id?: string;
  sessionId: string;
  moduleId: string;
  status: 'not_started' | 'learning' | 'completed';
  
  learningStartedAt?: string;
  learningCompletedAt?: string;
  
  quizScore?: number;
  quizAttempts: number;
  learningTimeMinutes: number;
  
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
