export interface QuizQuestionAssessmentEntity {
  id: string;
  quizId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  sequenceNumber: number;
}

/**
  Sanitized Question payload returned to candidates during active quiz attempt.
  Strictly excludes correctAnswer, explanation, and answer keys for security.
 */
export interface QuizSanitizedQuestion {
  id: string;
  question: string;
  options: string[];
  marks: number;
  sequenceNumber: number;
}

export interface QuizAssessmentEntity {
  id: string;
  title: string;
  topic: string;
  description: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  passPercentage: number;
  status: 'Draft' | 'Published' | 'Archived';
  createdBy?: string;
  createdAt: string;
  expiresAt: string;
  allowAnswerReview: boolean;
  allowRetake: boolean;
  questions: QuizQuestionAssessmentEntity[];
}

export type QuizInvitationStatus =
  | 'Sent'
  | 'Failed'
  | 'Not Opened'
  | 'Started'
  | 'Completed'
  | 'Expired';

export interface QuizInvitationEntity {
  id: string;
  quizId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  bootcampName?: string;
  department?: string;
  track?: string;
  token: string;
  tokenHash: string;
  status: QuizInvitationStatus;
  sentAt: string;
  expiresAt: string;
  attemptId?: string;
}

export type QuizAttemptStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Expired';

export interface QuizAnswerRecord {
  answerId: string;
  attemptId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect?: boolean;
  marksAwarded?: number;
  savedAt: string;
}

export interface QuizAttemptEntity {
  id: string;
  quizId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  invitationId: string;
  startedAt?: string;
  submittedAt?: string;
  status: QuizAttemptStatus;
  score: number;
  totalMarks: number;
  percentage: number;
  result?: 'PASSED' | 'FAILED';
  timeTakenSeconds: number;
  answers: Record<string, QuizAnswerRecord>; // questionId -> answer record
}

export interface QuizCandidateLandingInfo {
  quizTitle: string;
  description: string;
  topic: string;
  candidateName: string;
  candidateEmail: string;
  questionCount: number;
  durationMinutes: number;
  passPercentage: number;
  expiresAt: string;
  status: QuizInvitationStatus;
  attemptStatus: QuizAttemptStatus;
  allowRetake: boolean;
}

export interface QuizActiveAttemptState {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  candidateName: string;
  questionCount: number;
  durationMinutes: number;
  startedAt: string;
  remainingTimeSeconds: number;
  questions: QuizSanitizedQuestion[];
  savedAnswers: Record<string, string>; // questionId -> selectedAnswer
  status: QuizAttemptStatus;
}

export interface QuizEvaluationResult {
  attemptId: string;
  candidateName: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'PASSED' | 'FAILED';
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  timeTakenSeconds: number;
  timeTakenFormatted: string;
  submittedAt: string;
  allowAnswerReview: boolean;
  questionReviews?: Array<{
    questionId: string;
    question: string;
    options: string[];
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface QuestionAccuracyMetric {
  questionId: string;
  questionText: string;
  correctPercent: number;
  incorrectPercent: number;
  unansweredPercent: number;
  totalResponses: number;
}

export interface QuizLiveDashboardSummary {
  quizId: string;
  quizTitle: string;
  totalInvited: number;
  notStartedCount: number;
  inProgressCount: number;
  completedCount: number;
  passedCount: number;
  failedCount: number;
  averageScore: number;
  highestScore: number;
  averageCompletionTimeSeconds: number;
  averageCompletionTimeFormatted: string;
  completionPercentage: number;
  passPercentage: number;
  candidates: Array<{
    invitationId: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    invitationStatus: QuizInvitationStatus;
    attemptStatus: QuizAttemptStatus;
    score?: number;
    percentage?: number;
    result?: 'PASSED' | 'FAILED';
    timeTakenFormatted?: string;
    startedAt?: string;
    submittedAt?: string;
  }>;
  questionAnalytics: QuestionAccuracyMetric[];
}
