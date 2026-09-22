import { Module } from '@nestjs/common';
import { AiQuizController } from './ai-quiz.controller.js';
import { AiQuizService } from './ai-quiz.service.js';
import { AzureOpenAiService } from './azure-openai.service.js';

@Module({
  controllers: [AiQuizController],
  providers: [AiQuizService, AzureOpenAiService],
  exports: [AiQuizService, AzureOpenAiService],
})
export class AiModule {}

