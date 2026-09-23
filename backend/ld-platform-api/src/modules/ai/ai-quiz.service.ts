import { Injectable, Logger } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, Min, Max, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { AzureOpenAiService } from './azure-openai.service.js';

export class GenerateQuizInput {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  topic!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  questionCount?: number;

  @IsOptional()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface QuizQuestionDto {
  id: string;
  question: string;
  type: 'multiple_choice' | 'type_answer';
  options: string[];
  correctAnswer: string;
  explanation: string;
  timeLimit: number;
  points: number;
}

export interface GeneratedQuizDto {
  title: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questions: QuizQuestionDto[];
}

export class RegenerateQuestionInput {
  @IsString()
  topic!: string;

  @IsString()
  questionId!: string;

  @IsObject()
  currentQuestion!: QuizQuestionDto;

  @IsString()
  @IsIn(['easier', 'harder', 'different', 'change_type'])
  action!: 'easier' | 'harder' | 'different' | 'change_type';

  @IsOptional()
  @IsString()
  difficulty?: string;
}

@Injectable()
export class AiQuizService {
  private readonly logger = new Logger(AiQuizService.name);

  constructor(private readonly azureOpenAiService: AzureOpenAiService) {}

  async generateQuiz(input: GenerateQuizInput): Promise<GeneratedQuizDto> {
    const topic = input.topic?.trim() || 'Data Engineering & SQL';
    const difficulty = input.difficulty || 'Intermediate';
    const questionCount = Number(input.questionCount) || 10;
    const generationSeed = `run_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    this.logger.log(`Generating AI Quiz for topic: "${topic}" (${difficulty}, ${questionCount} questions, seed: ${generationSeed})`);

    if (this.azureOpenAiService.isConfigured()) {
      try {
        const rawContent = await this.azureOpenAiService.getCompletion(
          `You are an expert L&D Technical Assessment Quiz Generator for enterprise training programs.
Return ONLY valid JSON matching this exact structure:
{
  "title": "Quiz Title based on Topic",
  "topic": "Clean Topic Name",
  "difficulty": "${difficulty}",
  "questionCount": ${questionCount},
  "questions": [
    {
      "id": "q1",
      "question": "Clear, concise technical question?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Detailed explanation of why Option B is correct.",
      "timeLimit": 30,
      "points": 10
    }
  ]
}
CRITICAL RULES:
1. MANDATORY UNIQUNESS (Seed: "${generationSeed}"): Every single generation run MUST produce a brand-new, 100% unique set of questions for topic "${topic}". Explore diverse subtopics, architectural choices, performance tuning, or real-world debugging scenarios. DO NOT output repetitive questions from previous runs.
2. CONCISE OPTIONS ONLY: Keep all multiple-choice options VERY SHORT (1 to 6 words each max). DO NOT write long paragraph options. For example, use "Partition Pruning" instead of "Applying idempotent partition pruning and columnar query filtering".
3. Ensure options are plausible distractors with EXACTLY one clear correct answer matching one of the options.
4. Respect difficulty level: ${difficulty}.
5. Do NOT include markdown code blocks. Output raw JSON object only.`,
          `Generation Seed: ${generationSeed}. Generate a fresh, unique ${questionCount}-question ${difficulty} multiple-choice quiz on topic: "${topic}". Ensure all ${questionCount} questions cover different aspects of the topic and all options are concise (1-6 words).`,
          { jsonMode: true, temperature: 0.9 }
        );

        const aiResponse = JSON.parse(rawContent);
        if (aiResponse && aiResponse.questions && aiResponse.questions.length > 0) {
          return this.validateAndFormatResponse(aiResponse, topic, difficulty, questionCount);
        }
      } catch (err: any) {
        this.logger.warn(`Azure OpenAI quiz call failed, switching to structured fallback generator: ${err.message}`);
      }
    }

    return this.generateDynamicTopicQuiz(input);
  }

  async regenerateQuestion(input: RegenerateQuestionInput): Promise<QuizQuestionDto> {
    const { topic, action, currentQuestion } = input;
    this.logger.log(`Regenerating single question [${currentQuestion?.id}] with action: "${action}" for topic: "${topic}" via Azure OpenAI`);

    let newDifficulty = input.difficulty || 'Intermediate';
    if (action === 'easier') newDifficulty = 'Beginner';
    if (action === 'harder') newDifficulty = 'Advanced';

    const newType = action === 'change_type'
      ? (currentQuestion?.type === 'multiple_choice' ? 'type_answer' : 'multiple_choice')
      : (currentQuestion?.type || 'multiple_choice');

    if (this.azureOpenAiService.isConfigured()) {
      try {
        let actionPrompt = '';
        if (action === 'easier') {
          actionPrompt = `Create a SIMPLER, easier conceptual question on topic "${topic}" suitable for a Beginner. Simplify the terminology and options.`;
        } else if (action === 'harder') {
          actionPrompt = `Create a MORE ADVANCED, expert-level scenario/troubleshooting question on topic "${topic}".`;
        } else if (action === 'change_type') {
          actionPrompt = `Create a question on topic "${topic}" using format "${newType}". (If type_answer, options MUST be an empty array []; if multiple_choice, provide 4 short options).`;
        } else {
          actionPrompt = `Create a fresh, completely DIFFERENT question on topic "${topic}" testing a distinct sub-concept.`;
        }

        const systemPrompt = `You are an expert L&D quiz generator.
Return ONLY valid JSON for a SINGLE question with this exact structure:
{
  "id": "${currentQuestion?.id || 'q-regen'}",
  "question": "Clear, concise technical question?",
  "type": "${newType}",
  "options": ${newType === 'type_answer' ? '[]' : '["Option A", "Option B", "Option C", "Option D"]'},
  "correctAnswer": "Correct Option or Answer String",
  "explanation": "Clear explanation of why this answer is correct.",
  "timeLimit": 30,
  "points": 10
}
CRITICAL RULES:
1. DO NOT repeat the previous question: "${currentQuestion?.question || ''}".
2. ${newType === 'multiple_choice' ? 'Keep options VERY SHORT (1 to 6 words each).' : 'Set options to an empty array [].'}
3. Difficulty target: ${newDifficulty}.
4. Output raw JSON object only. No markdown.`;

        const userPrompt = `${actionPrompt}\nPrevious question was: "${currentQuestion?.question || ''}". Generate 1 new question now. (Nonce: ${Date.now()}_${Math.floor(Math.random() * 10000)})`;

        const rawContent = await this.azureOpenAiService.getCompletion(systemPrompt, userPrompt, {
          jsonMode: true,
          temperature: 0.85,
        });

        const q = JSON.parse(rawContent);
        if (q && q.question) {
          const options = Array.isArray(q.options) && newType === 'multiple_choice'
            ? q.options.map((opt: any) => String(opt).trim())
            : [];
          const correctAnswer = q.correctAnswer && options.includes(q.correctAnswer) ? q.correctAnswer : (options[0] || String(q.correctAnswer || ''));
          return {
            id: currentQuestion?.id || `q-${Date.now()}`,
            question: String(q.question),
            type: newType,
            options,
            correctAnswer,
            explanation: String(q.explanation || `Correct answer is ${correctAnswer}.`),
            timeLimit: Number(q.timeLimit) || 30,
            points: Number(q.points) || 10,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Azure OpenAI single question regeneration failed, switching to fallback: ${err.message}`);
      }
    }

    return this.generateSingleDynamicQuestion(topic, newDifficulty, newType, currentQuestion?.id || 'q-1', action);
  }

  private async callAzureOpenAI(
    input: GenerateQuizInput,
    apiKey: string,
    endpoint: string,
    deployment: string
  ): Promise<any> {
    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    
    const systemPrompt = `You are an expert L&D Technical Assessment Quiz Generator for enterprise training programs.
Return ONLY valid JSON matching this exact structure:
{
  "title": "Quiz Title based on Topic",
  "topic": "Clean Topic Name",
  "difficulty": "${input.difficulty || 'Intermediate'}",
  "questionCount": ${input.questionCount || 10},
  "questions": [
    {
      "id": "q1",
      "question": "Clear, concise technical question?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Detailed explanation of why Option B is correct and others are incorrect.",
      "timeLimit": 30,
      "points": 10
    }
  ]
}
Rules:
1. Generate accurate, practical, real-world questions specifically tailored to the topic "${input.topic}".
2. Ensure options are plausible distractors with EXACTLY one clear correct answer matching one of the options.
3. Include clear explanations for each question.
4. Avoid duplicate questions.
5. Respect difficulty level: ${input.difficulty}.
6. Do NOT include markdown wrappers like \`\`\`json. Output raw JSON only.`;

    const userPrompt = `Generate a ${input.questionCount || 10}-question ${input.difficulty || 'Intermediate'} multiple-choice quiz on the topic: "${input.topic}".`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      throw new Error(`Azure OpenAI returned status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }

  private validateAndFormatResponse(
    rawJson: any,
    fallbackTopic: string,
    fallbackDifficulty: string,
    targetCount: number
  ): GeneratedQuizDto {
    const rawQuestions: QuizQuestionDto[] = (rawJson.questions || []).map((q: any, idx: number) => {
      const options = Array.isArray(q.options) && q.options.length > 0
        ? q.options.map((opt: any) => String(opt).trim())
        : ['Option A', 'Option B', 'Option C', 'Option D'];
      const correctAnswer = q.correctAnswer && options.includes(q.correctAnswer) ? q.correctAnswer : options[0];
      return {
        id: q.id || `q-${idx + 1}-${Date.now()}`,
        question: q.question || `Question ${idx + 1} regarding ${fallbackTopic}?`,
        type: 'multiple_choice',
        options,
        correctAnswer,
        explanation: q.explanation || `Correct answer is ${correctAnswer}.`,
        timeLimit: Number(q.timeLimit) || 30,
        points: Number(q.points) || 10,
      };
    });

    // Deduplicate questions to prevent repeating items
    const seenTexts = new Set<string>();
    const uniqueQuestions: QuizQuestionDto[] = [];

    for (const q of rawQuestions) {
      const normalized = q.question.trim().toLowerCase();
      if (!seenTexts.has(normalized)) {
        seenTexts.add(normalized);
        uniqueQuestions.push(q);
      }
    }

    // Fill remaining if duplicates were returned by AI
    let idx = uniqueQuestions.length + 1;
    while (uniqueQuestions.length < targetCount && idx <= targetCount + 12) {
      const fallbackQ = this.generateSingleDynamicQuestion(fallbackTopic, fallbackDifficulty, 'multiple_choice', `q-${idx}`, 'initial', idx);
      const normalized = fallbackQ.question.trim().toLowerCase();
      if (!seenTexts.has(normalized)) {
        seenTexts.add(normalized);
        uniqueQuestions.push(fallbackQ);
      }
      idx++;
    }

    return {
      title: rawJson.title || `${fallbackTopic} Quiz`,
      topic: rawJson.topic || fallbackTopic,
      difficulty: rawJson.difficulty || fallbackDifficulty,
      questionCount: uniqueQuestions.length,
      questions: uniqueQuestions,
    };
  }

  private generateDynamicTopicQuiz(input: GenerateQuizInput): GeneratedQuizDto {
    const rawTopic = input.topic?.trim() || 'Data Engineering';
    const difficulty = input.difficulty || 'Intermediate';
    const count = Number(input.questionCount) || 10;

    const questions: QuizQuestionDto[] = [];
    const seenTexts = new Set<string>();

    for (let i = 1; i <= count; i++) {
      const q = this.generateSingleDynamicQuestion(rawTopic, difficulty, 'multiple_choice', `q-${i}`, 'initial', i);
      const normalized = q.question.trim().toLowerCase();
      if (!seenTexts.has(normalized)) {
        seenTexts.add(normalized);
        questions.push(q);
      }
    }

    return {
      title: `${rawTopic} Quiz`,
      topic: rawTopic,
      difficulty,
      questionCount: questions.length,
      questions,
    };
  }

  private generateSingleDynamicQuestion(
    topic: string,
    difficulty: string,
    type: 'multiple_choice' | 'type_answer',
    id: string,
    action: string = 'initial',
    index: number = 1
  ): QuizQuestionDto {
    const cleanTopic = topic.trim();
    const isAdvanced = difficulty === 'Advanced';
    const isBeginner = difficulty === 'Beginner';

    const questionTemplates = [
      {
        q: `Which core mechanism optimizes query performance in ${cleanTopic}?`,
        opts: ['Partition Pruning', 'Static Thread Delays', 'Disabling Commit Logs', 'Flat Unindexed Files'],
        correct: 'Partition Pruning',
        explanation: `Partition pruning avoids scanning unnecessary data files during ${cleanTopic} execution.`
      },
      {
        q: `How does ${cleanTopic} maintain transaction isolation under high concurrency?`,
        opts: ['MVCC & Commit Logs', 'Global Table Locking', 'Client Local Storage', 'Silent Overwrites'],
        correct: 'MVCC & Commit Logs',
        explanation: `Multi-version concurrency control and commit logs ensure non-blocking concurrent operations in ${cleanTopic}.`
      },
      {
        q: `What primary diagnostic metric isolates execution bottlenecks in ${cleanTopic}?`,
        opts: ['DAG Timelines & Task Spill', 'Network Cable Length', 'String Data Conversion', 'Disabling Telemetry'],
        correct: 'DAG Timelines & Task Spill',
        explanation: `Analyzing DAG execution timelines and task memory spill pinpoints bottlenecks in ${cleanTopic}.`
      },
      {
        q: `Which technique eliminates data skew during shuffle operations in ${cleanTopic}?`,
        opts: ['Salting Join Keys', 'Disabling Partitioning', 'Infinite Client Timeouts', 'Plaintext Local Storage'],
        correct: 'Salting Join Keys',
        explanation: `Salting join keys distributes hot keys evenly across worker nodes in ${cleanTopic}.`
      },
      {
        q: `What architectural pattern ensures reliable failure recovery in ${cleanTopic}?`,
        opts: ['WAL & Checkpointing', 'Hardcoded Server IPs', 'Disabling Replicas', 'Manual File Copies'],
        correct: 'WAL & Checkpointing',
        explanation: `Write-ahead logs and state checkpointing allow seamless fault recovery in ${cleanTopic}.`
      },
      {
        q: `Which storage format offers optimal compression and columnar projection for ${cleanTopic}?`,
        opts: ['Parquet', 'Uncompressed CSV', 'Raw JSON Text', 'XML Payload'],
        correct: 'Parquet',
        explanation: `Parquet provides efficient columnar projection and compression for ${cleanTopic} processing.`
      },
      {
        q: `What approach reduces memory pressure during large-scale aggregation in ${cleanTopic}?`,
        opts: ['Map-Side Combiners', 'Increasing Heap Size Only', 'Disabling Garbage Collection', 'Synchronous File Lock'],
        correct: 'Map-Side Combiners',
        explanation: `Map-side combiners reduce data volume before network shuffle operations in ${cleanTopic}.`
      },
      {
        q: `Which consistency model is prioritized in transactional ${cleanTopic} engines?`,
        opts: ['ACID Compliance', 'Eventually Inconsistent', 'No Auditing', 'Temporary Buffer Lock'],
        correct: 'ACID Compliance',
        explanation: `ACID compliance guarantees atomic, consistent, isolated, and durable operations in ${cleanTopic}.`
      },
      {
        q: `How do you secure sensitive data payloads at rest in ${cleanTopic}?`,
        opts: ['AES-256 Encryption', 'Base64 Encoding Only', 'Plaintext Logs', 'HTTP Unencrypted Stream'],
        correct: 'AES-256 Encryption',
        explanation: `AES-256 encryption secures stored data artifacts against unauthorized access in ${cleanTopic}.`
      },
      {
        q: `Which indexing strategy accelerates point lookups in ${cleanTopic}?`,
        opts: ['B-Tree & Bloom Filters', 'Linear Sequential Scan', 'Random Hashing', 'Disabling Indexing'],
        correct: 'B-Tree & Bloom Filters',
        explanation: `Bloom filters and B-Trees prune non-matching data files rapidly during ${cleanTopic} point lookups.`
      },
      {
        q: `What strategy minimizes network transfer overhead in distributed ${cleanTopic} clusters?`,
        opts: ['Broadcast Joins', 'Full Cross Joins', 'Uncompressed Telemetry', 'Single-Threaded Transfers'],
        correct: 'Broadcast Joins',
        explanation: `Broadcast joins replicate small lookup tables to executors, avoiding heavy shuffle network transfer in ${cleanTopic}.`
      },
      {
        q: `Which metric indicates memory spill during sorting operations in ${cleanTopic}?`,
        opts: ['Spill to Disk (Bytes)', 'CPU Temperature', 'Screen Resolution', 'File Path Length'],
        correct: 'Spill to Disk (Bytes)',
        explanation: `Spill to disk measures data written to disk when memory buffer memory limits are exceeded in ${cleanTopic}.`
      }
    ];

    const template = questionTemplates[(index - 1) % questionTemplates.length];
    
    let questionText = template.q;
    let options = [...template.opts];
    let correct = template.correct;
    let explanation = template.explanation;

    if (action === 'easier' || isBeginner) {
      questionText = `What is the primary function of ${cleanTopic}?`;
      options = ['Data Processing & Analytics', 'Hardware Power Management', 'Theme Color Generation', 'Disabling Authentication'];
      correct = options[0];
      explanation = `${cleanTopic} provides foundational mechanisms designed for structured technical operations and data management.`;
    } else if (action === 'harder' || isAdvanced) {
      questionText = `In enterprise ${cleanTopic}, how do you eliminate partition skew during join shuffles?`;
      options = ['Salting Join Keys with Hints', 'Disabling Partitioning', 'Infinite Timeout Loops', 'Plaintext Local Storage'];
      correct = options[0];
      explanation = `Salting join keys breaks up hot keys evenly across partition executors in ${cleanTopic}.`;
    } else if (action === 'different') {
      questionText = `Which feature set distinguishes ${cleanTopic} from traditional legacy processing methods?`;
      options = ['Auto-Scaling & Declarative APIs', 'Manual FTP File Transfers', 'Single-Threaded File Locks', 'Binary Hex Editing'];
      correct = options[0];
      explanation = `Modern ${cleanTopic} implementations prioritize automated scalability, declarative interfaces, and robust schema management.`;
    }

    if (type === 'type_answer') {
      options = [];
    }

    return {
      id: id || `q-${index}-${Date.now()}`,
      question: questionText,
      type,
      options,
      correctAnswer: correct,
      explanation,
      timeLimit: 30,
      points: 10,
    };
  }

  private parseTimeSec(timeStr?: string): number {
    if (!timeStr) return 30;
    const num = parseInt(timeStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 30 : num;
  }
}
