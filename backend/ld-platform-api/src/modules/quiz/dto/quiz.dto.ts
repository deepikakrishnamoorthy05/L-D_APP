export class CreateQuizDto {
  title!: string;
  topic!: string;
  difficulty!: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount!: number;
  questions!: Array<{
    id?: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    timeLimit?: number;
    points?: number;
  }>;
}

export class StartSessionDto {
  quizId!: string;
}

export class JoinSessionDto {
  sessionId?: string;
  joinCode?: string;
  employeeId?: string;
  employeeName!: string;
}

export class SubmitAnswerDto {
  sessionId!: string;
  questionId!: string;
  participantId!: string;
  selectedAnswer!: string;
  responseTimeMs?: number;
  responseTimeSec?: number;
}
