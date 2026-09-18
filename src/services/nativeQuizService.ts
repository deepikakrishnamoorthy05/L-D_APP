import { io, Socket } from 'socket.io-client';
import { QuizQuestion } from '../types/assessment';

export interface NativeQuiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  questions: QuizQuestion[];
}

export interface NativeQuizParticipant {
  id: string;
  employeeId: string;
  employeeName: string;
  score: number;
  correctAnswersCount?: number;
  totalQuestions?: number;
  totalTimeMs?: number;
  formattedTime?: string;
  rank?: number;
  isTieBreakerWon?: boolean;
  tieBreakerReason?: string;
  joinedAt: string;
  completedAt?: string;
}

export interface NativeQuizSession {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  joinCode: string;
  status: 'Waiting' | 'Live' | 'AnswerReveal' | 'Leaderboard' | 'Completed' | 'Cancelled';
  currentQuestionIndex: number;
  startedAt?: string;
  endedAt?: string;
  participants: NativeQuizParticipant[];
}

export interface NativeQuizSessionSummary {
  sessionId: string;
  quizTitle: string;
  topic: string;
  totalParticipants: number;
  averageScore: number;
  passRate: number;
  topScore: number;
  leaderboard: Array<{
    participantId: string;
    employeeId: string;
    employeeName: string;
    totalScore: number;
    correctAnswersCount: number;
    totalQuestions?: number;
    totalTimeMs?: number;
    formattedTime?: string;
    percentage: number;
    rank: number;
    status: 'Pass' | 'Needs Attention' | 'Fail';
    isTieBreakerWon?: boolean;
    tieBreakerReason?: string;
  }>;
  endedAt: string;
}

class NativeQuizService {
  private socket: Socket | null = null;
  private readonly apiBaseUrl = '/api';

  public getSocket(): Socket {
    if (!this.socket) {
      this.socket = io({
        autoConnect: false,
        transports: ['websocket', 'polling'],
      });
    }
    if (!this.socket.connected) {
      this.socket.connect();
    }
    return this.socket;
  }

  public disconnectSocket() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // --- REST API HELPER METHODS ---

  public async createQuiz(quiz: NativeQuiz): Promise<NativeQuiz> {
    try {
      const res = await fetch(`${this.apiBaseUrl}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend REST API unavailable, using in-memory quiz instance:', err);
      return quiz;
    }
  }

  public async startLiveSession(quizId: string, fallbackQuiz?: any): Promise<NativeQuizSession> {
    try {
      const res = await fetch(`${this.apiBaseUrl}/quizzes/${quizId}/start-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend REST API unavailable, synthesizing local live session fallback:', err);
      const joinCode = Math.floor(100000 + Math.random() * 900000).toString();
      return {
        id: `session-local-${Date.now()}`,
        quizId: quizId || 'quiz-local-1',
        quizTitle: fallbackQuiz?.title || 'Interactive Technical Quiz',
        topic: fallbackQuiz?.topic || 'General Technical Topic',
        joinCode,
        status: 'Waiting',
        currentQuestionIndex: 0,
        startedAt: new Date().toISOString(),
        participants: [],
      };
    }
  }

  public async getSessionByCode(joinCode: string): Promise<NativeQuizSession | null> {
    try {
      const res = await fetch(`${this.apiBaseUrl}/quiz-sessions/code/${joinCode.trim()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend REST API lookup failed, falling back to local verification:', err);
      return null;
    }
  }

  public async endSession(sessionId: string): Promise<NativeQuizSessionSummary | null> {
    try {
      const res = await fetch(`${this.apiBaseUrl}/quiz-sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend end session REST API failed:', err);
      return null;
    }
  }
}

export const nativeQuizService = new NativeQuizService();
