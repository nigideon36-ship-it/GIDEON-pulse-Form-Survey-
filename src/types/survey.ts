export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'rating'
  | 'nps'
  | 'likert'
  | 'yes_no'
  | 'date';

export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_answered'
  | 'is_empty';

export type LogicAction = 'show' | 'hide' | 'jump_to';

export interface LogicRule {
  id: string;
  questionId: string;
  operator: LogicOperator;
  value: any;
  action: LogicAction;
  targetQuestionId?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
  ratingShape?: 'star' | 'number' | 'heart';
  ratingLabels?: { min?: string; max?: string };
  likertStatements?: string[];
  likertScale?: string[];
  minSelect?: number;
  maxSelect?: number;
  logic?: LogicRule[];
}

export interface SurveyTheme {
  primaryColor: string; // e.g. '#2563eb', '#0d9488', '#4f46e5', '#e11d48'
  mode: 'card_step' | 'scroll';
  fontFamily: 'sans' | 'serif' | 'mono';
  borderRadius: 'rounded-md' | 'rounded-xl' | 'rounded-2xl' | 'rounded-none';
  showProgress: boolean;
}

export interface SurveySettings {
  allowAnonymous: boolean;
  requireEmail: boolean;
  collectName: boolean;
  responseLimit?: number;
  closingDate?: string;
  redirectUrl?: string;
  customThankYouTitle?: string;
  customThankYouMessage?: string;
}

export type SurveyCategory =
  | 'Customer Experience'
  | 'Product & Engineering'
  | 'Human Resources'
  | 'Market Research'
  | 'Event & Community';

export type SurveyStatus = 'active' | 'draft' | 'closed';

export interface Survey {
  id: string;
  title: string;
  description: string;
  category: SurveyCategory;
  status: SurveyStatus;
  questions: Question[];
  theme: SurveyTheme;
  settings: SurveySettings;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentEmail?: string;
  respondentName?: string;
  respondentAvatar?: string;
  completionTimeSeconds: number;
  submittedAt: string;
  answers: Record<string, any>;
}

export interface AIAnalysisResult {
  executiveSummary: string;
  sentiment: {
    positivePercent: number;
    neutralPercent: number;
    negativePercent: number;
  };
  keyStrengths: string[];
  frictionPoints: string[];
  actionableRecommendations: {
    priority: 'High' | 'Medium' | 'Low';
    action: string;
    expectedImpact: string;
  }[];
}
