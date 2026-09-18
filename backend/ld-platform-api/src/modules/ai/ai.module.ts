import { Module } from '@nestjs/common';
import { AiQuizController } from './ai-quiz.controller.js';
import { AiQuizService } from './ai-quiz.service.js';

@Module({
  controllers: [AiQuizController],
  providers: [AiQuizService],
  exports: [AiQuizService],
})
export class AiModule {}
