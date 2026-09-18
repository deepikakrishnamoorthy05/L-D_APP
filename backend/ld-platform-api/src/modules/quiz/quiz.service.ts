import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  QuizEntity,
  QuizQuestionEntity,
  QuizSessionEntity,
  QuizParticipantEntity,
  QuizResponseEntity,
  QuizSessionResultSummary,
  QuizParticipantResult,
} from './entities/quiz.entity.js';
import { CreateQuizDto, JoinSessionDto, SubmitAnswerDto } from './dto/quiz.dto.js';

function formatTimeMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  // In-memory repositories for prototype live quiz execution
  private readonly quizzes: Map<string, QuizEntity> = new Map();
  private readonly sessions: Map<string, QuizSessionEntity> = new Map();
  private readonly codeToSessionId: Map<string, string> = new Map();

  constructor() {
    this.seedSampleQuiz();
  }

  private seedSampleQuiz() {
    const sampleQuiz: QuizEntity = {
      id: 'quiz-sql-demo',
      title: 'SQL Joins & Window Functions Quiz',
      topic: 'SQL Joins and Window Functions',
      difficulty: 'Intermediate',
      questionCount: 5,
      status: 'Ready',
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q-1',
          quizId: 'quiz-sql-demo',
          question: 'Which SQL JOIN clause returns only matching rows present in both tables?',
          optionA: 'LEFT JOIN',
          optionB: 'INNER JOIN',
          optionC: 'RIGHT JOIN',
          optionD: 'CROSS JOIN',
          options: ['LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
          correctAnswer: 'INNER JOIN',
          explanation: 'INNER JOIN evaluates the ON condition and returns rows that exist in both datasets.',
          points: 1000,
          timeLimit: 30,
        },
        {
          id: 'q-2',
          quizId: 'quiz-sql-demo',
          question: 'What is the key difference between RANK() and DENSE_RANK() window functions?',
          optionA: 'RANK() skips rank numbers after ties, whereas DENSE_RANK() does not skip rank values.',
          optionB: 'DENSE_RANK() requires ORDER BY while RANK() does not.',
          optionC: 'RANK() works only on integer fields.',
          optionD: 'There is no difference between RANK() and DENSE_RANK().',
          options: [
            'RANK() skips rank numbers after ties, whereas DENSE_RANK() does not skip rank values.',
            'DENSE_RANK() requires ORDER BY while RANK() does not.',
            'RANK() works only on integer fields.',
            'There is no difference between RANK() and DENSE_RANK().',
          ],
          correctAnswer: 'RANK() skips rank numbers after ties, whereas DENSE_RANK() does not skip rank values.',
          explanation: 'RANK() produces gaps in ranking sequence after tie values, while DENSE_RANK() assigns consecutive rank integers.',
          points: 1000,
          timeLimit: 30,
        },
        {
          id: 'q-3',
          quizId: 'quiz-sql-demo',
          question: 'Which clause defines the sliding window subset of rows for window calculations?',
          optionA: 'GROUP BY',
          optionB: 'PARTITION BY',
          optionC: 'HAVING',
          optionD: 'ROWS BETWEEN',
          options: ['GROUP BY', 'PARTITION BY', 'HAVING', 'ROWS BETWEEN'],
          correctAnswer: 'PARTITION BY',
          explanation: 'PARTITION BY breaks rowsets into logical window partitions for aggregate functions.',
          points: 1000,
          timeLimit: 30,
        },
        {
          id: 'q-4',
          quizId: 'quiz-sql-demo',
          question: 'What is returned by a CROSS JOIN between a table with 5 rows and a table with 4 rows?',
          optionA: '9 rows',
          optionB: '20 rows',
          optionC: '5 rows',
          optionD: '4 rows',
          options: ['9 rows', '20 rows', '5 rows', '4 rows'],
          correctAnswer: '20 rows',
          explanation: 'A CROSS JOIN generates a Cartesian product of all rows: 5 × 4 = 20 rows.',
          points: 1000,
          timeLimit: 30,
        },
        {
          id: 'q-5',
          quizId: 'quiz-sql-demo',
          question: 'Which window function accesses a value from a previous row within the current partition?',
          optionA: 'LEAD()',
          optionB: 'LAG()',
          optionC: 'FIRST_VALUE()',
          optionD: 'NTH_VALUE()',
          options: ['LEAD()', 'LAG()', 'FIRST_VALUE()', 'NTH_VALUE()'],
          correctAnswer: 'LAG()',
          explanation: 'LAG() reads data from a preceding row at a given offset within the partition.',
          points: 1000,
          timeLimit: 30,
        },
      ],
    };

    this.quizzes.set(sampleQuiz.id, sampleQuiz);
  }

  // --- REST QUIZ CRUD ---

  createQuiz(dto: CreateQuizDto): QuizEntity {
    const id = `quiz-${Date.now()}`;
    const formattedQuestions: QuizQuestionEntity[] = (dto.questions || []).map((q, idx) => {
      const opts = Array.isArray(q.options) && q.options.length >= 4 ? q.options : ['A', 'B', 'C', 'D'];
      return {
        id: q.id || `q-${id}-${idx + 1}`,
        quizId: id,
        question: q.question,
        optionA: opts[0] || 'Option A',
        optionB: opts[1] || 'Option B',
        optionC: opts[2] || 'Option C',
        optionD: opts[3] || 'Option D',
        options: opts,
        correctAnswer: q.correctAnswer || opts[0],
        explanation: q.explanation || 'No explanation provided.',
        points: q.points || 1000,
        timeLimit: q.timeLimit || 30,
      };
    });

    const quiz: QuizEntity = {
      id,
      title: dto.title || `${dto.topic} Quiz`,
      topic: dto.topic,
      difficulty: dto.difficulty || 'Intermediate',
      questionCount: formattedQuestions.length,
      questions: formattedQuestions,
      status: 'Ready',
      createdAt: new Date().toISOString(),
    };

    this.quizzes.set(id, quiz);
    this.logger.log(`Created Quiz [${id}]: "${quiz.title}" (${quiz.questionCount} Qs)`);
    return quiz;
  }

  getAllQuizzes(): QuizEntity[] {
    return Array.from(this.quizzes.values());
  }

  getQuizById(id: string): QuizEntity {
    const quiz = this.quizzes.get(id);
    if (!quiz) throw new NotFoundException(`Quiz with ID ${id} not found.`);
    return quiz;
  }

  updateQuiz(id: string, updates: Partial<QuizEntity>): QuizEntity {
    const existing = this.getQuizById(id);
    const updated = { ...existing, ...updates };
    this.quizzes.set(id, updated);
    return updated;
  }

  // --- LIVE QUIZ SESSIONS ---

  startSession(quizId: string): QuizSessionEntity {
    const quiz = this.getQuizById(quizId);
    const sessionId = `session-${Date.now()}`;
    const joinCode = this.generate6DigitCode();

    const session: QuizSessionEntity = {
      id: sessionId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      topic: quiz.topic,
      joinCode,
      status: 'Waiting',
      currentQuestionIndex: 0,
      startedAt: new Date().toISOString(),
      questionStartTimestamps: {},
      participants: [],
      responses: [],
    };

    this.sessions.set(sessionId, session);
    this.codeToSessionId.set(joinCode, sessionId);
    this.logger.log(`Started Live Quiz Session [${sessionId}] with Join Code: ${joinCode}`);
    return session;
  }

  recordQuestionStartTime(sessionId: string, questionIndex: number): number {
    const session = this.getSessionById(sessionId);
    const now = Date.now();
    if (!session.questionStartTimestamps) {
      session.questionStartTimestamps = {};
    }
    session.questionStartTimestamps[questionIndex] = now;
    this.sessions.set(session.id, session);
    return now;
  }

  getSessionById(id: string): QuizSessionEntity {
    const session = this.sessions.get(id);
    if (!session) throw new NotFoundException(`Session with ID ${id} not found.`);
    return session;
  }

  getSessionByCode(code: string): QuizSessionEntity {
    const cleanCode = code.trim();
    const sessionId = this.codeToSessionId.get(cleanCode);
    if (!sessionId) throw new NotFoundException(`Quiz Session with join code "${cleanCode}" not found.`);
    return this.getSessionById(sessionId);
  }

  joinSession(dto: JoinSessionDto, socketId?: string): { session: QuizSessionEntity; participant: QuizParticipantEntity } {
    const session = this.getSessionByCode(dto.joinCode);

    if (session.status === 'Completed' || session.status === 'Cancelled') {
      throw new BadRequestException('This Live Quiz Session has ended.');
    }

    const quiz = this.getQuizById(session.quizId);
    const employeeName = dto.employeeName?.trim() || 'Trainee Participant';
    const employeeId = dto.employeeId?.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    let participant = session.participants.find((p) => p.employeeId === employeeId || p.employeeName === employeeName);

    if (!participant) {
      participant = {
        id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sessionId: session.id,
        employeeId,
        employeeName,
        score: 0,
        correctAnswersCount: 0,
        totalQuestions: quiz.questionCount || 10,
        totalTimeMs: 0,
        formattedTime: '00:00',
        lastSubmittedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        socketId,
      };
      session.participants.push(participant);
    } else {
      participant.socketId = socketId;
    }

    this.sessions.set(session.id, session);
    this.logger.log(`Participant "${employeeName}" joined Session [${session.id}] (${session.participants.length} total)`);
    return { session, participant };
  }

  submitAnswer(dto: SubmitAnswerDto): { response: QuizResponseEntity; responseCount: number; totalParticipants: number } {
    const session = this.getSessionById(dto.sessionId);
    const quiz = this.getQuizById(session.quizId);

    const question = quiz.questions.find((q) => q.id === dto.questionId);
    if (!question) throw new NotFoundException('Question not found in quiz.');

    // Prevent duplicate submissions per question
    const existing = session.responses.find(
      (r) => r.questionId === dto.questionId && r.participantId === dto.participantId
    );
    if (existing) {
      throw new BadRequestException('You have already submitted an answer for this question.');
    }

    const isCorrect = dto.selectedAnswer === question.correctAnswer;
    const now = Date.now();

    // Backend-driven response time calculation: DO NOT trust frontend time alone
    const qIndex = session.currentQuestionIndex;
    const qStartTime = session.questionStartTimestamps?.[qIndex] || (now - 15000);
    const responseTimeMs = Math.max(0, now - qStartTime);

    // MARKS: Speed does NOT give extra marks! Marks come ONLY from correct answers (1,000 points per correct answer)
    const pointsEarned = isCorrect ? 1000 : 0;

    const response: QuizResponseEntity = {
      id: `resp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId: session.id,
      questionId: dto.questionId,
      participantId: dto.participantId,
      selectedAnswer: dto.selectedAnswer,
      isCorrect,
      responseTimeMs,
      pointsEarned,
      submittedAt: new Date(now).toISOString(),
    };

    session.responses.push(response);

    // Update participant cumulative score & time
    const participant = session.participants.find((p) => p.id === dto.participantId);
    if (participant) {
      participant.score += pointsEarned;
      if (isCorrect) {
        participant.correctAnswersCount += 1;
      }
      participant.totalTimeMs += responseTimeMs;
      participant.formattedTime = formatTimeMs(participant.totalTimeMs);
      participant.lastSubmittedAt = response.submittedAt;
    }

    this.sessions.set(session.id, session);

    const currentQuestionResponses = session.responses.filter((r) => r.questionId === dto.questionId);
    return {
      response,
      responseCount: currentQuestionResponses.length,
      totalParticipants: session.participants.length,
    };
  }

  revealAnswer(sessionId: string, questionId: string): {
    correctAnswer: string;
    explanation: string;
    distribution: { optionA: number; optionB: number; optionC: number; optionD: number };
  } {
    const session = this.getSessionById(sessionId);
    const quiz = this.getQuizById(session.quizId);

    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) throw new NotFoundException('Question not found.');

    session.status = 'AnswerReveal';
    this.sessions.set(session.id, session);

    const responsesForQ = session.responses.filter((r) => r.questionId === questionId);

    const dist = {
      optionA: 0,
      optionB: 0,
      optionC: 0,
      optionD: 0,
    };

    responsesForQ.forEach((r) => {
      if (r.selectedAnswer === question.options[0] || r.selectedAnswer === question.optionA) dist.optionA++;
      else if (r.selectedAnswer === question.options[1] || r.selectedAnswer === question.optionB) dist.optionB++;
      else if (r.selectedAnswer === question.options[2] || r.selectedAnswer === question.optionC) dist.optionC++;
      else if (r.selectedAnswer === question.options[3] || r.selectedAnswer === question.optionD) dist.optionD++;
    });

    return {
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      distribution: dist,
    };
  }

  getLeaderboard(sessionId: string): QuizParticipantEntity[] {
    const session = this.getSessionById(sessionId);
    session.status = 'Leaderboard';

    // SORTING LOGIC:
    // 1. totalScore DESC (or correctAnswersCount DESC)
    // 2. totalTimeMs ASC (Fastest total completion time)
    // 3. lastSubmittedAt ASC (Earliest final submission timestamp)
    const sorted = [...session.participants].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.totalTimeMs !== b.totalTimeMs) {
        return a.totalTimeMs - b.totalTimeMs;
      }
      return new Date(a.lastSubmittedAt).getTime() - new Date(b.lastSubmittedAt).getTime();
    });

    // Reset tie-breaker flags & assign ranks
    sorted.forEach((p, idx) => {
      p.rank = idx + 1;
      p.isTieBreakerWon = false;
      p.tieBreakerReason = undefined;

      // Check if this participant won a tie over the next participant due to speed
      if (idx > 0) {
        const prev = sorted[idx - 1];
        if (prev.score === p.score && prev.totalTimeMs < p.totalTimeMs) {
          prev.isTieBreakerWon = true;
          prev.tieBreakerReason = 'Faster completion';
        }
      }
    });

    session.participants = sorted;
    this.sessions.set(session.id, session);
    return sorted;
  }

  endSession(sessionId: string): QuizSessionResultSummary {
    const session = this.getSessionById(sessionId);
    const quiz = this.getQuizById(session.quizId);

    session.status = 'Completed';
    session.endedAt = new Date().toISOString();

    const leaderboard = this.getLeaderboard(sessionId);

    const totalParticipants = leaderboard.length;
    const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;

    let sumPercent = 0;
    let passCount = 0;

    const participantResults: QuizParticipantResult[] = leaderboard.map((p, idx) => {
      const percentage = Math.min(100, Math.round((p.correctAnswersCount / Math.max(1, quiz.questionCount)) * 100));
      const status: 'Pass' | 'Needs Attention' = percentage >= 70 ? 'Pass' : 'Needs Attention';

      sumPercent += percentage;
      if (percentage >= 70) passCount++;

      return {
        participantId: p.id,
        employeeId: p.employeeId,
        employeeName: p.employeeName,
        totalScore: p.score,
        correctAnswersCount: p.correctAnswersCount,
        totalQuestions: quiz.questionCount,
        percentage,
        totalTimeMs: p.totalTimeMs,
        formattedTime: p.formattedTime || formatTimeMs(p.totalTimeMs),
        rank: idx + 1,
        status,
        isTieBreakerWon: p.isTieBreakerWon,
        tieBreakerReason: p.tieBreakerReason,
      };
    });

    const averageScore = totalParticipants > 0 ? Math.round(sumPercent / totalParticipants) : 0;
    const passRate = totalParticipants > 0 ? Math.round((passCount / totalParticipants) * 100) : 0;

    const summary: QuizSessionResultSummary = {
      sessionId: session.id,
      quizTitle: quiz.title,
      topic: quiz.topic,
      totalParticipants,
      averageScore,
      passRate,
      topScore,
      leaderboard: participantResults,
      endedAt: session.endedAt,
    };

    this.sessions.set(session.id, session);
    this.logger.log(`Ended Session [${sessionId}] — Avg Score: ${averageScore}%, Pass Rate: ${passRate}%`);
    return summary;
  }

  private generate6DigitCode(): string {
    let code: string;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.codeToSessionId.has(code));
    return code;
  }
}
