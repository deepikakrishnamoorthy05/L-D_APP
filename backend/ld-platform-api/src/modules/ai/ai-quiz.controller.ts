import { Controller, Get, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AiQuizService, GenerateQuizInput, RegenerateQuestionInput, GeneratedQuizDto, QuizQuestionDto } from './ai-quiz.service.js';
import { AzureOpenAiService } from './azure-openai.service.js';

@Controller('ai')
export class AiQuizController {
  constructor(
    private readonly aiQuizService: AiQuizService,
    private readonly azureOpenAiService: AzureOpenAiService
  ) {}

  @Get('status')
  getAiStatus() {
    const isConfigured = this.azureOpenAiService.isConfigured();
    const config = isConfigured ? this.azureOpenAiService.getConfig() : null;
    return {
      status: isConfigured ? 'AZURE_OPENAI_ACTIVE' : 'LOCAL_INTELLIGENCE_FALLBACK',
      provider: isConfigured ? 'Azure OpenAI Service' : 'Built-in Rule Engine',
      deployment: config?.deployment || 'gpt-4o',
      apiVersion: config?.apiVersion || '2024-02-15-preview',
      isConfigured,
    };
  }

  @Post('quizzes/generate')
  @HttpCode(HttpStatus.OK)
  async generateQuiz(@Body() input: GenerateQuizInput): Promise<GeneratedQuizDto> {
    if (!input || !input.topic || input.topic.trim() === '') {
      throw new BadRequestException('Topic parameter is required for quiz generation.');
    }
    return this.aiQuizService.generateQuiz(input);
  }

  @Post('quizzes/regenerate-question')
  @HttpCode(HttpStatus.OK)
  async regenerateQuestion(@Body() input: RegenerateQuestionInput): Promise<QuizQuestionDto> {
    if (!input || !input.topic || !input.currentQuestion) {
      throw new BadRequestException('Topic and currentQuestion parameters are required.');
    }
    return this.aiQuizService.regenerateQuestion(input);
  }

  @Post('copilot')
  @HttpCode(HttpStatus.OK)
  async copilotQuery(@Body() body: { query: string; systemPrompt?: string }) {
    if (!body || !body.query) {
      throw new BadRequestException('Query text is required.');
    }

    if (this.azureOpenAiService.isConfigured()) {
      try {
        const sysPrompt = body.systemPrompt || 'You are an enterprise L&D Intelligence Copilot assistant for Systech Solutions.';
        const responseText = await this.azureOpenAiService.getCompletion(sysPrompt, body.query);
        return {
          source: 'AZURE_OPENAI',
          answer: responseText,
        };
      } catch (err: any) {
        return {
          source: 'FALLBACK',
          error: err.message,
          message: 'Azure OpenAI call failed. Operating in fallback mode.',
        };
      }
    }

    return {
      source: 'LOCAL_ENGINE',
      message: 'Azure OpenAI key is not configured in backend .env. Operating in fallback mode.',
    };
  }
}

