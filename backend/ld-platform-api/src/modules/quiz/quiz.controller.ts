import {
  Controller,
  Get,
  Post,
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
