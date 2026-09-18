import { Injectable, Logger } from '@nestjs/common';

export class GenerateQuizInput {
  sessionId?: string;
  topic!: string;
  questionCount?: number;
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
  topic!: string;
  questionId!: string;
  currentQuestion!: QuizQuestionDto;
  action!: 'easier' | 'harder' | 'different' | 'change_type';
  difficulty?: string;
}

@Injectable()
export class AiQuizService {
  private readonly logger = new Logger(AiQuizService.name);

  async generateQuiz(input: GenerateQuizInput): Promise<GeneratedQuizDto> {
    const topic = input.topic?.trim() || 'Data Engineering & SQL';
    const difficulty = input.difficulty || 'Intermediate';
    const questionCount = Number(input.questionCount) || 10;

    this.logger.log(`Generating AI Quiz for topic: "${topic}" (${difficulty}, ${questionCount} questions)`);

    const apiKey = process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';

    if (apiKey && endpoint) {
      try {
        const aiResponse = await this.callAzureOpenAI(input, apiKey, endpoint, deployment);
        if (aiResponse && aiResponse.questions && aiResponse.questions.length > 0) {
          return this.validateAndFormatResponse(aiResponse, topic, difficulty, questionCount);
        }
      } catch (err: any) {
        this.logger.warn(`Azure OpenAI call failed, switching to structured fallback generator: ${err.message}`);
      }
    }

    return this.generateDynamicTopicQuiz(input);
  }

  async regenerateQuestion(input: RegenerateQuestionInput): Promise<QuizQuestionDto> {
    const { topic, action, currentQuestion } = input;
    this.logger.log(`Regenerating single question [${currentQuestion.id}] with action: "${action}" for topic: "${topic}"`);

    let newDifficulty = input.difficulty || 'Intermediate';
    if (action === 'easier') newDifficulty = 'Beginner';
    if (action === 'harder') newDifficulty = 'Advanced';

    const newType = action === 'change_type'
      ? (currentQuestion.type === 'multiple_choice' ? 'type_answer' : 'multiple_choice')
      : currentQuestion.type;

    const regenerated = this.generateSingleDynamicQuestion(topic, newDifficulty, newType, currentQuestion.id, action);
    return regenerated;
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
    const questions: QuizQuestionDto[] = (rawJson.questions || []).map((q: any, idx: number) => {
      const options = Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
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

    return {
      title: rawJson.title || `${fallbackTopic} Quiz`,
      topic: rawJson.topic || fallbackTopic,
      difficulty: rawJson.difficulty || fallbackDifficulty,
      questionCount: questions.length || targetCount,
      questions,
    };
  }

  private generateDynamicTopicQuiz(input: GenerateQuizInput): GeneratedQuizDto {
    const rawTopic = input.topic?.trim() || 'Data Engineering';
    const difficulty = input.difficulty || 'Intermediate';
    const count = Number(input.questionCount) || 10;

    const questions: QuizQuestionDto[] = [];
    for (let i = 1; i <= count; i++) {
      const q = this.generateSingleDynamicQuestion(rawTopic, difficulty, 'multiple_choice', `q-${i}`, 'initial', i);
      q.timeLimit = 30;
      questions.push(q);
    }

    return {
      title: `${rawTopic} Quiz`,
      topic: rawTopic,
      difficulty,
      questionCount: count,
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
        q: `What is a core architectural requirement when implementing ${cleanTopic} in enterprise production data pipelines?`,
        opts: [
          `Ensuring idempotency, fault tolerance, and scalable resource isolation for ${cleanTopic}`,
          `Disabling transaction logs to increase single-node execution speed`,
          `Hardcoding static IP addresses in the core application configuration`,
          `Using unindexed legacy flat files for intermediate state storage`
        ],
        correct: `Ensuring idempotency, fault tolerance, and scalable resource isolation for ${cleanTopic}`,
        explanation: `Production ${cleanTopic} implementations require idempotent processing, exception handling, and resource isolation to prevent cascading failures.`
      },
      {
        q: `Which best practice optimizes query performance and execution latency in ${cleanTopic}?`,
        opts: [
          `Applying predicate pushdown, partition pruning, and column projection`,
          `Executing Cartesian CROSS JOINs across unindexed tables`,
          `Storing all records in a single unpartitioned raw CSV dataset`,
          `Disabling memory caching and metadata statistics auto-collection`
        ],
        correct: `Applying predicate pushdown, partition pruning, and column projection`,
        explanation: `Partition pruning and predicate pushdown drastically reduce data scanning overhead in ${cleanTopic} execution engines.`
      },
      {
        q: `How does ${cleanTopic} handle concurrent updates and consistency guarantees?`,
        opts: [
          `Through ACID transaction logs, multi-version concurrency control (MVCC), and atomic commits`,
          `By locking the entire database during all read queries`,
          `By silently overwriting conflicting records without audit logging`,
          `By storing transactional history in temporary client browser storage`
        ],
        correct: `Through ACID transaction logs, multi-version concurrency control (MVCC), and atomic commits`,
        explanation: `Modern ${cleanTopic} systems utilize MVCC and commit logs to provide isolated, concurrent read and write operations.`
      },
      {
        q: `When troubleshooting memory spill or performance degradation in ${cleanTopic}, what is the primary diagnostic approach?`,
        opts: [
          `Analyze execution plan DAGs, stage metrics, and data skew distribution`,
          `Increase thread sleep delays in the client caller application`,
          `Convert all numeric fields into string representations`,
          `Disable logging and telemetry monitoring`
        ],
        correct: `Analyze execution plan DAGs, stage metrics, and data skew distribution`,
        explanation: `Examining DAG execution metrics and data skew allows engineers to pinpoint bottleneck stages and resolve memory spill in ${cleanTopic}.`
      },
      {
        q: `What is the primary trade-off when configuring high availability for ${cleanTopic}?`,
        opts: [
          `Latency vs consistency balance according to the CAP theorem principles`,
          `CPU core clock frequency vs monitor resolution`,
          `User interface dark mode vs light mode rendering times`,
          `File extension length vs filename character count`
        ],
        correct: `Latency vs consistency balance according to the CAP theorem principles`,
        explanation: `Distributed systems running ${cleanTopic} trade off consistency, availability, and network partition tolerance depending on system SLA.`
      }
    ];

    const template = questionTemplates[(index - 1) % questionTemplates.length];
    
    let questionText = template.q;
    let options = [...template.opts];
    let correct = template.correct;
    let explanation = template.explanation;

    if (action === 'easier' || isBeginner) {
      questionText = `What is the fundamental purpose of ${cleanTopic}?`;
      options = [
        `To provide standardized data processing and structured technical capabilities for ${cleanTopic}`,
        `To replace physical network interface hardware`,
        `To automatically generate random CSS layout themes`,
        `To disable database authentication checks`
      ];
      correct = options[0];
      explanation = `${cleanTopic} provides foundational mechanisms designed for structured technical operations and data management.`;
    } else if (action === 'harder' || isAdvanced) {
      questionText = `In an advanced enterprise scenario involving ${cleanTopic}, how do you mitigate high data skew during shuffle operations?`;
      options = [
        `Salting keys with random prefixes and utilizing isolated skew hint directives`,
        `Relying on default round-robin partitioning without custom keys`,
        `Increasing client timeout to infinite seconds`,
        `Storing intermediate state in plain text emails`
      ];
      correct = options[0];
      explanation = `Salting join/groupby keys breaks up hot keys evenly across partition executors in ${cleanTopic}.`;
    } else if (action === 'different') {
      questionText = `Which feature set distinguishes ${cleanTopic} from traditional legacy processing methods?`;
      options = [
        `Native distributed execution, automated schema evolution, and declarative APIs`,
        `Manual batch file copy operations via FTP scripts`,
        `Single-threaded synchronous file locks`,
        `Requiring manual binary file hex editing`
      ];
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
