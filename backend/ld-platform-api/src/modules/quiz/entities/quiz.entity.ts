export interface QuizQuestionEntity {
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
  points: number;
  timeLimit: number;
}

export interface QuizEntity {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  questions: QuizQuestionEntity[];
  createdBy?: string;
  status: 'Draft' | 'Ready' | 'Archived';
  createdAt: string;
}

export interface QuizParticipantEntity {
  id: string;
  sessionId: string;
  employeeId: string;
  employeeName: string;
  score: number;
  correctAnswersCount: number;
  totalQuestions: number;
  totalTimeMs: number;
  formattedTime: string;
  lastSubmittedAt: string;
  rank?: number;
  isTieBreakerWon?: boolean;
  tieBreakerReason?: string;
  joinedAt: string;
  socketId?: string;
}

export interface QuizResponseEntity {
  id: string;
  sessionId: string;
  questionId: string;
  participantId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
  submittedAt: string;
}

export type QuizSessionStatus =
  | 'Draft'
  | 'Ready'
  | 'Waiting'
  | 'Live'
  | 'AnswerReveal'
  | 'Leaderboard'
  | 'Completed'
  | 'Cancelled';

export interface QuizSessionEntity {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  joinCode: string;
  status: QuizSessionStatus;
  currentQuestionIndex: number;
  startedAt?: string;
  endedAt?: string;
  questionStartTimestamps: Record<number, number>;
  participants: QuizParticipantEntity[];
  responses: QuizResponseEntity[];
}

export interface QuizParticipantResult {
  participantId: string;
  employeeId: string;
  employeeName: string;
  totalScore: number;
  correctAnswersCount: number;
  totalQuestions: number;
  percentage: number;
  totalTimeMs: number;
  formattedTime: string;
  rank: number;
  status: 'Pass' | 'Needs Attention';
  isTieBreakerWon?: boolean;
  tieBreakerReason?: string;
}

export interface QuizSessionResultSummary {
  sessionId: string;
  quizTitle: string;
  topic: string;
  totalParticipants: number;
  averageScore: number;
  passRate: number;
  topScore: number;
  leaderboard: QuizParticipantResult[];
  endedAt: string;
}
