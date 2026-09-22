import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { QuizService } from './quiz.service.js';
import { CreateQuizDto } from './dto/quiz.dto.js';
import type { QuizEntity, QuizSessionEntity, QuizSessionResultSummary } from './entities/quiz.entity.js';
import type {
  QuizAssessmentEntity,
  QuizInvitationEntity,
  QuizCandidateLandingInfo,
  QuizActiveAttemptState,
  QuizEvaluationResult,
  QuizLiveDashboardSummary,
  QuestionAccuracyMetric,
} from './entities/quiz-assessment.entity.js';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('quizzes')
  @HttpCode(HttpStatus.CREATED)
  createQuiz(@Body() dto: CreateQuizDto): QuizEntity {
    if (!dto || !dto.topic) {
      throw new BadRequestException('Topic field is required to create a quiz.');
    }
    return this.quizService.createQuiz(dto);
  }

  @Get('quizzes')
  getAllQuizzes(): QuizEntity[] {
    return this.quizService.getAllQuizzes();
  }

  @Get('quizzes/:id')
  getQuizById(@Param('id') id: string): QuizEntity {
    return this.quizService.getQuizById(id);
  }

  @Patch('quizzes/:id')
  updateQuiz(@Param('id') id: string, @Body() updates: Partial<QuizEntity>): QuizEntity {
    return this.quizService.updateQuiz(id, updates);
  }

  // --- ASSESSMENT MODULE REST ENDPOINTS ---

  @Post('assessments')
  @HttpCode(HttpStatus.CREATED)
  createAssessment(@Body() dto: Partial<QuizAssessmentEntity>): QuizAssessmentEntity {
    return this.quizService.createAssessment(dto);
  }

  @Get('assessments')
  getAllAssessments(): QuizAssessmentEntity[] {
    return this.quizService.getAllAssessments();
  }

  @Get('assessments/:id')
  getAssessmentById(@Param('id') id: string): QuizAssessmentEntity {
    return this.quizService.getAssessmentById(id);
  }

  @Put('assessments/:id')
  updateAssessment(@Param('id') id: string, @Body() updates: Partial<QuizAssessmentEntity>): QuizAssessmentEntity {
    return this.quizService.updateAssessment(id, updates);
  }

  @Post('assessments/:id/publish')
  @HttpCode(HttpStatus.OK)
  publishAssessment(@Param('id') id: string): QuizAssessmentEntity {
    return this.quizService.publishAssessment(id);
  }

  @Post('assessments/:id/invite')
  @HttpCode(HttpStatus.OK)
  inviteCandidates(
    @Param('id') id: string,
    @Body()
    payload: {
      candidates: Array<{
        candidateId: string;
        candidateName: string;
        candidateEmail: string;
        bootcampName?: string;
        department?: string;
        track?: string;
      }>;
    }
  ): QuizInvitationEntity[] {
    if (!payload || !Array.isArray(payload.candidates) || payload.candidates.length === 0) {
      throw new BadRequestException('At least one candidate must be provided for invitation.');
    }
    return this.quizService.assignAndInviteCandidates(id, payload.candidates);
  }

  // --- CANDIDATE UNIQUE TOKEN ATTEMPT ENDPOINTS ---

  @Get('quiz/attempt/:token')
  getCandidateLanding(@Param('token') token: string): QuizCandidateLandingInfo {
    return this.quizService.getCandidateLandingByToken(token);
  }

  @Post('quiz/attempt/:token/start')
  @HttpCode(HttpStatus.OK)
  startCandidateAttempt(@Param('token') token: string): QuizActiveAttemptState {
    return this.quizService.startCandidateAttemptByToken(token);
  }

  @Post('quiz/attempt/:token/answer')
  @HttpCode(HttpStatus.OK)
  autoSaveAnswer(
    @Param('token') token: string,
    @Body() payload: { questionId: string; selectedAnswer: string }
  ): { success: boolean; savedAt: string; remainingTimeSeconds: number } {
    if (!payload || !payload.questionId) {
      throw new BadRequestException('questionId is required.');
    }
    return this.quizService.autoSaveCandidateAnswer(token, payload.questionId, payload.selectedAnswer || '');
  }

  @Post('quiz/attempt/:token/submit')
  @HttpCode(HttpStatus.OK)
  submitCandidateAttempt(@Param('token') token: string): QuizEvaluationResult {
    return this.quizService.submitCandidateAttempt(token);
  }

  @Get('quiz/attempt/:token/result')
  getCandidateResult(@Param('token') token: string): QuizEvaluationResult {
    return this.quizService.getCandidateAttemptResultByToken(token);
  }

  // --- LIVE ADMIN DASHBOARD & ANALYTICS ---

  @Get('assessments/:id/results')
  getLiveDashboardSummary(@Param('id') id: string): QuizLiveDashboardSummary {
    return this.quizService.getLiveDashboardSummary(id);
  }

  @Get('assessments/:id/analytics')
  getQuizAnalytics(@Param('id') id: string): QuestionAccuracyMetric[] {
    return this.quizService.getQuizAnalytics(id);
  }

  // --- LIVE SESSION SOCKET ENDPOINTS ---

  @Post('quizzes/:id/start-session')
  @HttpCode(HttpStatus.OK)
  startSession(@Param('id') id: string): QuizSessionEntity {
    return this.quizService.startSession(id);
  }

  @Get('quiz-sessions/:id')
  getSessionById(@Param('id') id: string): QuizSessionEntity {
    return this.quizService.getSessionById(id);
  }

  @Get('quiz-sessions/code/:code')
  getSessionByCode(@Param('code') code: string): QuizSessionEntity {
    return this.quizService.getSessionByCode(code);
  }

  @Get('quiz-sessions/:id/results')
  getSessionResults(@Param('id') id: string): QuizSessionResultSummary {
    return this.quizService.endSession(id);
  }

  @Post('quiz-sessions/:id/end')
  @HttpCode(HttpStatus.OK)
  endSession(@Param('id') id: string): QuizSessionResultSummary {
    return this.quizService.endSession(id);
  }
}
