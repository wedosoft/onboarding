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
