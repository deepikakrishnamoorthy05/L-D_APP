import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AiQuizService, GenerateQuizInput, RegenerateQuestionInput, GeneratedQuizDto, QuizQuestionDto } from './ai-quiz.service.js';

@Controller('ai/quizzes')
export class AiQuizController {
  constructor(private readonly aiQuizService: AiQuizService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateQuiz(@Body() input: GenerateQuizInput): Promise<GeneratedQuizDto> {
    if (!input || !input.topic || input.topic.trim() === '') {
      throw new BadRequestException('Topic parameter is required for quiz generation.');
    }
    return this.aiQuizService.generateQuiz(input);
  }

  @Post('regenerate-question')
  @HttpCode(HttpStatus.OK)
  async regenerateQuestion(@Body() input: RegenerateQuestionInput): Promise<QuizQuestionDto> {
    if (!input || !input.topic || !input.currentQuestion) {
      throw new BadRequestException('Topic and currentQuestion parameters are required.');
    }
    return this.aiQuizService.regenerateQuestion(input);
  }
}
