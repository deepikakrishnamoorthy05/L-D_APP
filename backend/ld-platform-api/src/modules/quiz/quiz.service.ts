import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  QuizEntity,
  QuizQuestionEntity,
  QuizSessionEntity,
  QuizParticipantEntity,
  QuizResponseEntity,
  QuizSessionResultSummary,
  QuizParticipantResult,
} from './entities/quiz.entity.js';
import {
  QuizAssessmentEntity,
  QuizQuestionAssessmentEntity,
  QuizInvitationEntity,
  QuizAttemptEntity,
  QuizAnswerRecord,
  QuizCandidateLandingInfo,
  QuizActiveAttemptState,
  QuizEvaluationResult,
  QuizLiveDashboardSummary,
  QuestionAccuracyMetric,
  QuizSanitizedQuestion,
  QuizInvitationStatus,
} from './entities/quiz-assessment.entity.js';
import { CreateQuizDto, JoinSessionDto, SubmitAnswerDto } from './dto/quiz.dto.js';

function formatTimeMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  // In-memory repositories for prototype live quiz & assessment execution
  private readonly quizzes: Map<string, QuizEntity> = new Map();
  private readonly sessions: Map<string, QuizSessionEntity> = new Map();
  private readonly codeToSessionId: Map<string, string> = new Map();

  // Assessment repositories
  private readonly assessments: Map<string, QuizAssessmentEntity> = new Map();
  private readonly invitations: Map<string, QuizInvitationEntity> = new Map();
  private readonly tokenToInvitationId: Map<string, string> = new Map();
  private readonly attempts: Map<string, QuizAttemptEntity> = new Map();

  constructor() {
    this.seedSampleQuiz();
    this.seedSampleAssessment();
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

  private seedSampleAssessment() {
    const sampleAssessment: QuizAssessmentEntity = {
      id: 'quiz-de-sample',
      title: 'Data Engineering Architecture & Delta Lake Assessment',
      topic: 'Data Engineering & Delta Lake',
      description: 'Comprehensive evaluation covering Delta Lake optimization, Spark partitioned reads, and transactional integrity.',
      difficulty: 'Intermediate',
      durationMinutes: 20,
      passPercentage: 75,
      status: 'Published',
      createdBy: 'L&D Admin',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allowAnswerReview: true,
      allowRetake: false,
      questions: [
        {
          id: 'q-de-1',
          quizId: 'quiz-de-sample',
          question: 'Which command is used to optimize a Delta Lake table layout by compacting small files?',
          optionA: 'VACUUM',
          optionB: 'OPTIMIZE',
          optionC: 'REFRESH',
          optionD: 'ANALYZE',
          options: ['VACUUM', 'OPTIMIZE', 'REFRESH', 'ANALYZE'],
          correctAnswer: 'OPTIMIZE',
          explanation: 'The OPTIMIZE command compacts small Apache Parquet files into larger, uniform target files for faster read performance.',
          marks: 1,
          sequenceNumber: 1,
        },
        {
          id: 'q-de-2',
          quizId: 'quiz-de-sample',
          question: 'How does Delta Lake guarantee ACID transaction compliance under concurrent writes?',
          optionA: 'Using write-ahead JSON transaction log files (_delta_log)',
          optionB: 'By locking the entire storage account filesystem during writes',
          optionC: 'By relying on relational foreign key constraints',
          optionD: 'By storing table data in unindexed CSV chunks',
          options: [
            'Using write-ahead JSON transaction log files (_delta_log)',
            'By locking the entire storage account filesystem during writes',
            'By relying on relational foreign key constraints',
            'By storing table data in unindexed CSV chunks',
          ],
          correctAnswer: 'Using write-ahead JSON transaction log files (_delta_log)',
          explanation: '_delta_log commits atomic transaction commits ensuring serializable execution.',
          marks: 1,
          sequenceNumber: 2,
        },
      ],
    };

    this.assessments.set(sampleAssessment.id, sampleAssessment);
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
    this.logger.log(`Created Quiz [${id}]: "${quiz.title}" with ${quiz.questionCount} questions`);
    return quiz;
  }

  getAllQuizzes(): QuizEntity[] {
    return Array.from(this.quizzes.values());
  }

  getQuizById(id: string): QuizEntity {
    const quiz = this.quizzes.get(id);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID "${id}" not found.`);
    }
    return quiz;
  }

  updateQuiz(id: string, updates: Partial<QuizEntity>): QuizEntity {
    const existing = this.getQuizById(id);
    const updated: QuizEntity = {
      ...existing,
      ...updates,
      questionCount: updates.questions ? updates.questions.length : existing.questionCount,
    };
    this.quizzes.set(id, updated);
    return updated;
  }

  // --- ASSESSMENT MODULE (MENTIMETER STYLE) ---

  createAssessment(dto: Partial<QuizAssessmentEntity>): QuizAssessmentEntity {
    const id = dto.id || `quiz-asm-${Date.now()}`;
    const formattedQuestions: QuizQuestionAssessmentEntity[] = (dto.questions || []).map((q, idx) => {
      const opts = Array.isArray(q.options) && q.options.length >= 4 ? q.options : [q.optionA || 'A', q.optionB || 'B', q.optionC || 'C', q.optionD || 'D'];
      return {
        id: q.id || `q-${id}-${idx + 1}`,
        quizId: id,
        question: q.question || `Question ${idx + 1}`,
        optionA: opts[0] || 'Option A',
        optionB: opts[1] || 'Option B',
        optionC: opts[2] || 'Option C',
        optionD: opts[3] || 'Option D',
        options: opts,
        correctAnswer: q.correctAnswer || opts[0],
        explanation: q.explanation || 'No detailed explanation provided.',
        marks: q.marks || 1,
        sequenceNumber: idx + 1,
      };
    });

    const assessment: QuizAssessmentEntity = {
      id,
      title: dto.title || `${dto.topic || 'L&D'} Assessment`,
      topic: dto.topic || 'General Technical Training',
      description: dto.description || 'Enterprise L&D skill evaluation assessment.',
      difficulty: dto.difficulty || 'Intermediate',
      durationMinutes: dto.durationMinutes || 15,
      passPercentage: dto.passPercentage || 70,
      status: dto.status || 'Draft',
      createdBy: dto.createdBy || 'L&D Admin',
      createdAt: new Date().toISOString(),
      expiresAt: dto.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allowAnswerReview: dto.allowAnswerReview !== undefined ? dto.allowAnswerReview : true,
      allowRetake: dto.allowRetake || false,
      questions: formattedQuestions,
    };

    this.assessments.set(id, assessment);
    this.logger.log(`Created Assessment [${id}]: "${assessment.title}" (${assessment.status})`);
    return assessment;
  }

  getAssessmentById(id: string): QuizAssessmentEntity {
    const assessment = this.assessments.get(id);
    if (!assessment) {
      // Fallback check in quizzes map
      const q = this.quizzes.get(id);
      if (q) {
        return {
          id: q.id,
          title: q.title,
          topic: q.topic,
          description: `Assessment for ${q.topic}`,
          difficulty: q.difficulty === 'Beginner' ? 'Easy' : q.difficulty === 'Advanced' ? 'Advanced' : 'Intermediate',
          durationMinutes: 15,
          passPercentage: 70,
          status: 'Published',
          createdAt: q.createdAt,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          allowAnswerReview: true,
          allowRetake: false,
          questions: q.questions.map((item, idx) => ({
            id: item.id,
            quizId: id,
            question: item.question,
            optionA: item.optionA,
            optionB: item.optionB,
            optionC: item.optionC,
            optionD: item.optionD,
            options: item.options,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
            marks: 1,
            sequenceNumber: idx + 1,
          })),
        };
      }
      throw new NotFoundException(`Assessment with ID "${id}" not found.`);
    }
    return assessment;
  }

  getAllAssessments(): QuizAssessmentEntity[] {
    return Array.from(this.assessments.values());
  }

  updateAssessment(id: string, updates: Partial<QuizAssessmentEntity>): QuizAssessmentEntity {
    const existing = this.getAssessmentById(id);
    const updatedQuestions = updates.questions
      ? updates.questions.map((q, idx) => ({
          ...q,
          sequenceNumber: idx + 1,
          options: q.options && q.options.length >= 4 ? q.options : [q.optionA || 'A', q.optionB || 'B', q.optionC || 'C', q.optionD || 'D'],
        }))
      : existing.questions;

    const updated: QuizAssessmentEntity = {
      ...existing,
      ...updates,
      questions: updatedQuestions,
    };

    this.assessments.set(id, updated);
    this.logger.log(`Updated Assessment [${id}]: status="${updated.status}", questions=${updated.questions.length}`);
    return updated;
  }

  publishAssessment(id: string): QuizAssessmentEntity {
    const assessment = this.getAssessmentById(id);
    if (!assessment.questions || assessment.questions.length === 0) {
      throw new BadRequestException('Cannot publish a quiz with 0 questions.');
    }
    assessment.status = 'Published';
    this.assessments.set(id, assessment);
    this.logger.log(`Published Assessment [${id}]`);
    return assessment;
  }

  assignAndInviteCandidates(
    quizId: string,
    candidates: Array<{
      candidateId: string;
      candidateName: string;
      candidateEmail: string;
      bootcampName?: string;
      department?: string;
      track?: string;
    }>
  ): QuizInvitationEntity[] {
    const quiz = this.getAssessmentById(quizId);
    if (quiz.status === 'Draft') {
      throw new ForbiddenException('Cannot send invitations for a Draft quiz. Please publish the quiz first.');
    }

    const createdInvitations: QuizInvitationEntity[] = [];

    for (const c of candidates) {
      let existingInv = Array.from(this.invitations.values()).find(
        (inv) => inv.quizId === quizId && inv.candidateId === c.candidateId
      );

      if (!existingInv) {
        const secureToken = `tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
        const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        existingInv = {
          id: invitationId,
          quizId,
          candidateId: c.candidateId,
          candidateName: c.candidateName,
          candidateEmail: c.candidateEmail,
          bootcampName: c.bootcampName || 'Shared Bootcamp',
          department: c.department || 'Data & AI',
          track: c.track || 'DE',
          token: secureToken,
          tokenHash: hashToken(secureToken),
          status: 'Sent',
          sentAt: new Date().toISOString(),
          expiresAt: quiz.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        this.invitations.set(invitationId, existingInv);
        this.tokenToInvitationId.set(secureToken, invitationId);
      }

      createdInvitations.push(existingInv);
    }

    this.logger.log(`Invited ${createdInvitations.length} candidates for Quiz [${quizId}]`);
    return createdInvitations;
  }

  // --- CANDIDATE ATTEMPT FLOW ---

  private getInvitationByToken(token: string): QuizInvitationEntity {
    const invId = this.tokenToInvitationId.get(token);
    let inv = invId ? this.invitations.get(invId) : undefined;

    if (!inv) {
      inv = Array.from(this.invitations.values()).find((i) => i.token === token);
    }

    if (!inv) {
      throw new NotFoundException('Invalid or expired assessment invitation token.');
    }

    if (new Date() > new Date(inv.expiresAt)) {
      inv.status = 'Expired';
      throw new ForbiddenException('This assessment invitation link has expired.');
    }

    return inv;
  }

  getCandidateLandingByToken(token: string): QuizCandidateLandingInfo {
    const inv = this.getInvitationByToken(token);
    const quiz = this.getAssessmentById(inv.quizId);
    const attempt = inv.attemptId ? this.attempts.get(inv.attemptId) : undefined;

    return {
      quizTitle: quiz.title,
      description: quiz.description,
      topic: quiz.topic,
      candidateName: inv.candidateName,
      candidateEmail: inv.candidateEmail,
      questionCount: quiz.questions.length,
      durationMinutes: quiz.durationMinutes,
      passPercentage: quiz.passPercentage,
      expiresAt: inv.expiresAt,
      status: inv.status,
      attemptStatus: attempt ? attempt.status : 'Not Started',
      allowRetake: quiz.allowRetake,
    };
  }

  startCandidateAttemptByToken(token: string): QuizActiveAttemptState {
    const inv = this.getInvitationByToken(token);
    const quiz = this.getAssessmentById(inv.quizId);

    let attempt: QuizAttemptEntity | undefined;

    if (inv.attemptId) {
      attempt = this.attempts.get(inv.attemptId);
    }

    if (attempt && attempt.status === 'Completed' && !quiz.allowRetake) {
      throw new ForbiddenException('You have already completed this assessment. Re-attempts are disabled.');
    }

    if (!attempt || (attempt.status === 'Completed' && quiz.allowRetake)) {
      const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      attempt = {
        id: attemptId,
        quizId: quiz.id,
        candidateId: inv.candidateId,
        candidateName: inv.candidateName,
        candidateEmail: inv.candidateEmail,
        invitationId: inv.id,
        startedAt: new Date().toISOString(),
        status: 'In Progress',
        score: 0,
        totalMarks: quiz.questions.length,
        percentage: 0,
        timeTakenSeconds: 0,
        answers: {},
      };

      this.attempts.set(attemptId, attempt);
      inv.attemptId = attemptId;
      inv.status = 'Started';
      this.invitations.set(inv.id, inv);
    }

    // Calculate server remaining time
    const startTimeMs = new Date(attempt.startedAt || new Date().toISOString()).getTime();
    const elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
    const totalAllowedSeconds = quiz.durationMinutes * 60;
    const remainingTimeSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);

    if (remainingTimeSeconds <= 0 && attempt.status === 'In Progress') {
      this.submitCandidateAttempt(token);
      throw new ForbiddenException('Quiz time has expired and your answers have been auto-submitted.');
    }

    // SECURITY: Strip out correctAnswer and explanation from question payload!
    const sanitizedQuestions: QuizSanitizedQuestion[] = quiz.questions.map((q, idx) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      marks: q.marks || 1,
      sequenceNumber: idx + 1,
    }));

    const savedAnswersMap: Record<string, string> = {};
    Object.values(attempt.answers).forEach((ans) => {
      savedAnswersMap[ans.questionId] = ans.selectedAnswer;
    });

    return {
      attemptId: attempt.id,
      quizId: quiz.id,
      quizTitle: quiz.title,
      candidateName: inv.candidateName,
      questionCount: quiz.questions.length,
      durationMinutes: quiz.durationMinutes,
      startedAt: attempt.startedAt || new Date().toISOString(),
      remainingTimeSeconds,
      questions: sanitizedQuestions,
      savedAnswers: savedAnswersMap,
      status: attempt.status,
    };
  }

  autoSaveCandidateAnswer(
    token: string,
    questionId: string,
    selectedAnswer: string
  ): { success: boolean; savedAt: string; remainingTimeSeconds: number } {
    const inv = this.getInvitationByToken(token);
    if (!inv.attemptId) {
      throw new BadRequestException('Attempt not started yet.');
    }

    const attempt = this.attempts.get(inv.attemptId);
    if (!attempt || attempt.status === 'Completed') {
      throw new ForbiddenException('Attempt is already completed or invalid.');
    }

    const quiz = this.getAssessmentById(inv.quizId);

    const startTimeMs = new Date(attempt.startedAt || new Date().toISOString()).getTime();
    const totalAllowedSeconds = quiz.durationMinutes * 60;
    const elapsedSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
    const remainingTimeSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);

    if (remainingTimeSeconds <= 0) {
      this.submitCandidateAttempt(token);
      throw new ForbiddenException('Quiz duration expired. Answers submitted.');
    }

    const savedAt = new Date().toISOString();
    const answerId = `ans_${questionId}_${attempt.id}`;

    attempt.answers[questionId] = {
      answerId,
      attemptId: attempt.id,
      questionId,
      selectedAnswer,
      savedAt,
    };

    this.attempts.set(attempt.id, attempt);
    return { success: true, savedAt, remainingTimeSeconds };
  }

  submitCandidateAttempt(token: string): QuizEvaluationResult {
    const inv = this.getInvitationByToken(token);
    if (!inv.attemptId) {
      throw new BadRequestException('Attempt not started yet.');
    }

    const attempt = this.attempts.get(inv.attemptId);
    if (!attempt) {
      throw new NotFoundException('Attempt not found.');
    }

    const quiz = this.getAssessmentById(inv.quizId);

    const now = new Date();
    attempt.submittedAt = now.toISOString();
    attempt.status = 'Completed';

    const startTimeMs = new Date(attempt.startedAt || now.toISOString()).getTime();
    const timeTakenSeconds = Math.max(1, Math.floor((now.getTime() - startTimeMs) / 1000));
    attempt.timeTakenSeconds = timeTakenSeconds;

    // DETERMINISTIC SCORING ENGINE (NO AI API CALLS FOR SCORING)
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let marksObtained = 0;
    const totalMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const questionReviews: Array<{
      questionId: string;
      question: string;
      options: string[];
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }> = [];

    for (const q of quiz.questions) {
      const userAnsRecord = attempt.answers[q.id];
      const userAns = userAnsRecord ? userAnsRecord.selectedAnswer : '';
      const isCorrect = Boolean(userAns && userAns.trim() === q.correctAnswer.trim());

      if (!userAns) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
        marksObtained += q.marks || 1;
      } else {
        incorrectCount++;
      }

      if (userAnsRecord) {
        userAnsRecord.isCorrect = isCorrect;
        userAnsRecord.marksAwarded = isCorrect ? q.marks || 1 : 0;
      }

      questionReviews.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer: userAns || 'Not Answered',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const percentage = Math.min(100, Math.round((marksObtained / Math.max(1, totalMarks)) * 100));
    const passResult = percentage >= quiz.passPercentage ? 'PASSED' : 'FAILED';

    attempt.score = marksObtained;
    attempt.totalMarks = totalMarks;
    attempt.percentage = percentage;
    attempt.result = passResult;

    this.attempts.set(attempt.id, attempt);

    inv.status = 'Completed';
    this.invitations.set(inv.id, inv);

    this.logger.log(
      `Submitted Attempt [${attempt.id}] for candidate "${inv.candidateName}" — Score: ${marksObtained}/${totalMarks} (${percentage}%, ${passResult})`
    );

    return {
      attemptId: attempt.id,
      candidateName: inv.candidateName,
      quizTitle: quiz.title,
      score: marksObtained,
      totalMarks,
      percentage,
      status: passResult,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      unansweredCount,
      timeTakenSeconds,
      timeTakenFormatted: formatSeconds(timeTakenSeconds),
      submittedAt: attempt.submittedAt,
      allowAnswerReview: quiz.allowAnswerReview,
      questionReviews: quiz.allowAnswerReview ? questionReviews : undefined,
    };
  }

  getCandidateAttemptResultByToken(token: string): QuizEvaluationResult {
    const inv = this.getInvitationByToken(token);
    if (!inv.attemptId) {
      throw new BadRequestException('No attempt completed for this invitation.');
    }
    const attempt = this.attempts.get(inv.attemptId);
    if (!attempt || attempt.status !== 'Completed') {
      throw new BadRequestException('Assessment has not been completed yet.');
    }

    const quiz = this.getAssessmentById(inv.quizId);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const questionReviews = quiz.questions.map((q) => {
      const userAns = attempt.answers[q.id]?.selectedAnswer || '';
      const isCorrect = Boolean(userAns && userAns.trim() === q.correctAnswer.trim());
      if (!userAns) unansweredCount++;
      else if (isCorrect) correctCount++;
      else incorrectCount++;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer: userAns || 'Not Answered',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    return {
      attemptId: attempt.id,
      candidateName: inv.candidateName,
      quizTitle: quiz.title,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      status: attempt.result || (attempt.percentage >= quiz.passPercentage ? 'PASSED' : 'FAILED'),
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      unansweredCount,
      timeTakenSeconds: attempt.timeTakenSeconds,
      timeTakenFormatted: formatSeconds(attempt.timeTakenSeconds),
      submittedAt: attempt.submittedAt || new Date().toISOString(),
      allowAnswerReview: quiz.allowAnswerReview,
      questionReviews: quiz.allowAnswerReview ? questionReviews : undefined,
    };
  }

  // --- LIVE ADMIN DASHBOARD & ANALYTICS ---

  getLiveDashboardSummary(quizId: string): QuizLiveDashboardSummary {
    const quiz = this.getAssessmentById(quizId);
    const quizInvs = Array.from(this.invitations.values()).filter((inv) => inv.quizId === quizId);

    let notStartedCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let passedCount = 0;
    let failedCount = 0;
    let totalScoreSum = 0;
    let highestScore = 0;
    let totalTimeTakenSeconds = 0;

    const candidateList = quizInvs.map((inv) => {
      const attempt = inv.attemptId ? this.attempts.get(inv.attemptId) : undefined;
      const invStatus: QuizInvitationStatus = inv.status;
      const attemptStatus = attempt ? attempt.status : 'Not Started';

      if (attemptStatus === 'Not Started' || !attempt) {
        notStartedCount++;
      } else if (attemptStatus === 'In Progress') {
        inProgressCount++;
      } else if (attemptStatus === 'Completed') {
        completedCount++;
        if (attempt.result === 'PASSED') passedCount++;
        else failedCount++;

        totalScoreSum += attempt.percentage;
        if (attempt.percentage > highestScore) highestScore = attempt.percentage;
        totalTimeTakenSeconds += attempt.timeTakenSeconds || 0;
      }

      return {
        invitationId: inv.id,
        candidateId: inv.candidateId,
        candidateName: inv.candidateName,
        candidateEmail: inv.candidateEmail,
        invitationStatus: invStatus,
        attemptStatus,
        score: attempt?.score,
        percentage: attempt?.percentage,
        result: attempt?.result,
        timeTakenFormatted: attempt?.timeTakenSeconds ? formatSeconds(attempt.timeTakenSeconds) : undefined,
        startedAt: attempt?.startedAt,
        submittedAt: attempt?.submittedAt,
      };
    });

    const averageScore = completedCount > 0 ? Math.round(totalScoreSum / completedCount) : 0;
    const averageCompletionTimeSeconds = completedCount > 0 ? Math.round(totalTimeTakenSeconds / completedCount) : 0;
    const completionPercentage = quizInvs.length > 0 ? Math.round((completedCount / quizInvs.length) * 100) : 0;

    const questionAnalytics = this.getQuizAnalytics(quizId);

    return {
      quizId: quiz.id,
      quizTitle: quiz.title,
      totalInvited: quizInvs.length,
      notStartedCount,
      inProgressCount,
      completedCount,
      passedCount,
      failedCount,
      averageScore,
      highestScore,
      averageCompletionTimeSeconds,
      averageCompletionTimeFormatted: formatSeconds(averageCompletionTimeSeconds),
      completionPercentage,
      passPercentage: quiz.passPercentage,
      candidates: candidateList,
      questionAnalytics,
    };
  }

  getQuizAnalytics(quizId: string): QuestionAccuracyMetric[] {
    const quiz = this.getAssessmentById(quizId);
    const completedAttempts = Array.from(this.attempts.values()).filter(
      (att) => att.quizId === quizId && att.status === 'Completed'
    );

    const totalCount = Math.max(1, completedAttempts.length);

    return quiz.questions.map((q) => {
      let correct = 0;
      let incorrect = 0;
      let unanswered = 0;

      completedAttempts.forEach((att) => {
        const userAnsRecord = att.answers[q.id];
        const userAns = userAnsRecord?.selectedAnswer;
        if (!userAns) {
          unanswered++;
        } else if (userAns.trim() === q.correctAnswer.trim()) {
          correct++;
        } else {
          incorrect++;
        }
      });

      return {
        questionId: q.id,
        questionText: q.question,
        correctPercent: Math.round((correct / totalCount) * 100),
        incorrectPercent: Math.round((incorrect / totalCount) * 100),
        unansweredPercent: Math.round((unanswered / totalCount) * 100),
        totalResponses: completedAttempts.length,
      };
    });
  }

  // --- LIVE QUIZ SOCKET SESSION METHODS ---

  startSession(quizId: string): QuizSessionEntity {
    const quiz = this.getQuizById(quizId);
    const joinCode = this.generate6DigitCode();
    const sessionId = `session-${Date.now()}`;

    const session: QuizSessionEntity = {
      id: sessionId,
      quizId,
      quizTitle: quiz.title,
      topic: quiz.topic,
      joinCode,
      status: 'Ready',
      currentQuestionIndex: 0,
      questionStartTimestamps: {},
      participants: [],
      responses: [],
    };

    this.sessions.set(sessionId, session);
    this.codeToSessionId.set(joinCode, sessionId);

    this.logger.log(`Started Live Session [${sessionId}] for Quiz "${quiz.title}" with Join Code: ${joinCode}`);
    return session;
  }

  getSessionById(sessionId: string): QuizSessionEntity {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Quiz Session with ID "${sessionId}" not found.`);
    }
    return session;
  }

  getSessionByCode(code: string): QuizSessionEntity {
    const sessionId = this.codeToSessionId.get(code);
    if (!sessionId) {
      throw new NotFoundException(`No active quiz session found for Join Code "${code}".`);
    }
    return this.getSessionById(sessionId);
  }

  recordQuestionStartTime(sessionId: string, questionIndex: number): void {
    const session = this.getSessionById(sessionId);
    session.questionStartTimestamps[questionIndex] = Date.now();
    this.sessions.set(session.id, session);
  }

  revealAnswer(sessionId: string, questionId: string): { correctAnswer: string; explanation: string; distribution: Record<string, number> } {
    const session = this.getSessionById(sessionId);
    const quiz = this.getQuizById(session.quizId);
    const question = quiz.questions.find((q) => q.id === questionId);

    const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    const qResponses = session.responses.filter((r) => r.questionId === questionId);

    qResponses.forEach((r) => {
      const idx = question?.options.indexOf(r.selectedAnswer);
      if (idx !== undefined && idx >= 0 && idx < 4) {
        const key = String.fromCharCode(65 + idx);
        dist[key] = (dist[key] || 0) + 1;
      }
    });

    return {
      correctAnswer: question?.correctAnswer || '',
      explanation: question?.explanation || '',
      distribution: dist,
    };
  }

  joinSession(dto: JoinSessionDto, socketId?: string): { session: QuizSessionEntity; participant: QuizParticipantEntity } {
    let session: QuizSessionEntity;

    if (dto.sessionId) {
      session = this.getSessionById(dto.sessionId);
    } else if (dto.joinCode) {
      session = this.getSessionByCode(dto.joinCode);
    } else {
      throw new BadRequestException('Either sessionId or joinCode must be provided.');
    }

    const quiz = this.getQuizById(session.quizId);

    const empId = dto.employeeId || `EMP-${Date.now().toString().slice(-4)}`;
    let participant = session.participants.find((p) => p.employeeId === empId);

    if (!participant) {
      const participantId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      participant = {
        id: participantId,
        sessionId: session.id,
        employeeId: empId,
        employeeName: dto.employeeName || 'Anonymous Candidate',
        score: 0,
        correctAnswersCount: 0,
        totalQuestions: quiz.questionCount,
        totalTimeMs: 0,
        formattedTime: '00:00',
        lastSubmittedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        socketId,
      };
      session.participants.push(participant);
    } else {
      if (socketId) participant.socketId = socketId;
    }

    this.sessions.set(session.id, session);
    this.logger.log(`Participant "${participant.employeeName}" (${participant.employeeId}) joined Session [${session.id}]`);
    return { session, participant };
  }

  submitAnswer(dto: SubmitAnswerDto): { isCorrect: boolean; response: QuizResponseEntity; updatedParticipant: QuizParticipantEntity; responseCount: number; totalParticipants: number } {
    const session = this.getSessionById(dto.sessionId);
    const quiz = this.getQuizById(session.quizId);

    const question = quiz.questions.find((q) => q.id === dto.questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID "${dto.questionId}" not found in quiz.`);
    }

    const participant = session.participants.find((p) => p.id === dto.participantId || p.employeeId === dto.participantId);
    if (!participant) {
      throw new NotFoundException(`Participant "${dto.participantId}" not found in session.`);
    }

    const isCorrect = dto.selectedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = 1;
    }

    const responseTimeMs = dto.responseTimeMs || (dto.responseTimeSec ? dto.responseTimeSec * 1000 : 0);

    const responseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const responseRecord: QuizResponseEntity = {
      id: responseId,
      sessionId: session.id,
      questionId: dto.questionId,
      participantId: participant.id,
      selectedAnswer: dto.selectedAnswer,
      isCorrect,
      responseTimeMs,
      pointsEarned,
      submittedAt: new Date().toISOString(),
    };

    session.responses = session.responses.filter(
      (r) => !(r.questionId === dto.questionId && r.participantId === participant.id)
    );
    session.responses.push(responseRecord);

    if (isCorrect) {
      participant.correctAnswersCount += 1;
      participant.score += 1;
    }

    participant.totalTimeMs += responseTimeMs;
    participant.formattedTime = formatTimeMs(participant.totalTimeMs);
    participant.lastSubmittedAt = new Date().toISOString();

    this.sessions.set(session.id, session);

    const responseCount = session.responses.filter((r) => r.questionId === dto.questionId).length;
    const totalParticipants = session.participants.length;

    return { isCorrect, response: responseRecord, updatedParticipant: participant, responseCount, totalParticipants };
  }

  getLeaderboard(sessionId: string): QuizParticipantEntity[] {
    const session = this.getSessionById(sessionId);

    const sorted = [...session.participants].sort((a, b) => {
      if (b.correctAnswersCount !== a.correctAnswersCount) {
        return b.correctAnswersCount - a.correctAnswersCount;
      }
      return a.totalTimeMs - b.totalTimeMs;
    });

    sorted.forEach((p, idx) => {
      p.rank = idx + 1;
      if (idx === 0 && sorted.length > 1 && sorted[0].correctAnswersCount === sorted[1].correctAnswersCount) {
        p.isTieBreakerWon = true;
        p.tieBreakerReason = 'Faster completion time';
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
