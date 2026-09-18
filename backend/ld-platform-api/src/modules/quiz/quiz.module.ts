import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service.js';
import { QuizController } from './quiz.controller.js';
import { QuizGateway } from './quiz.gateway.js';

@Module({
  controllers: [QuizController],
  providers: [QuizService, QuizGateway],
  exports: [QuizService, QuizGateway],
})
export class QuizModule {}
