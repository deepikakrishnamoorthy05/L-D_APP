import { AIQuizGenerationPayload, QuizQuestion } from '../types/assessment';

export interface GeneratedQuizResult {
  sessionId?: string;
  sessionName?: string;
  title: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questions: QuizQuestion[];
}

class AIQuizService {
  private readonly baseUrl = '/api/ai/quizzes';

  /**
   * Calls NestJS Backend API to generate AI Quiz via Azure OpenAI
   */
  public async generateQuiz(payload: AIQuizGenerationPayload): Promise<GeneratedQuizResult> {
    const finalCount = typeof payload.questionCount === 'number' ? payload.questionCount : 10;

    const requestBody = {
      sessionId: payload.sessionId,
      topic: payload.topic,
      difficulty: payload.difficulty,
      questionCount: finalCount,
    };

    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        title: data.title || `${payload.topic} Quiz`,
        topic: data.topic || payload.topic,
        difficulty: data.difficulty || payload.difficulty,
        questionCount: data.questions?.length || finalCount,
        questions: data.questions || [],
      };
    } catch (error) {
      console.warn('Backend API connection failed, executing client-side dynamic Quiz synthesis fallback:', error);
      return this.generateFallbackQuiz(payload, finalCount);
    }
  }

  /**
   * Calls NestJS Backend API to regenerate a single question
   */
  public async regenerateSingleQuestion(
    topic: string,
    questionId: string,
    currentQuestion: QuizQuestion,
    action: 'easier' | 'harder' | 'different' | 'change_type'
  ): Promise<QuizQuestion> {
    try {
      const response = await fetch(`${this.baseUrl}/regenerate-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          questionId,
          currentQuestion,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Single question API call failed, generating single fallback question:', error);
      return this.generateFallbackSingleQuestion(topic, questionId, currentQuestion, action);
    }
  }

  // --- Fallback client-side generator if NestJS backend server is unreached ---
  private generateFallbackQuiz(payload: AIQuizGenerationPayload, count: number): GeneratedQuizResult {
    const topic = payload.topic.trim() || 'Data Engineering';
    const questions: QuizQuestion[] = [];
    const seenTexts = new Set<string>();

    for (let i = 1; i <= count; i++) {
      const q = this.generateFallbackSingleQuestion(topic, `q-${i}-${Date.now()}`, {
        id: `q-${i}`,
        question: '',
        type: 'multiple_choice',
        options: [],
        correctAnswer: '',
        explanation: '',
      }, 'initial', i);

      const normalized = q.question.trim().toLowerCase();
      if (!seenTexts.has(normalized)) {
        seenTexts.add(normalized);
        questions.push(q);
      }
    }

    return {
      title: `${topic} Quiz`,
      topic,
      difficulty: payload.difficulty,
      questionCount: questions.length,
      questions,
    };
  }

  private generateFallbackSingleQuestion(
    topic: string,
    questionId: string,
    currentQuestion: QuizQuestion,
    action: string,
    index: number = 1
  ): QuizQuestion {
    const cleanTopic = topic.trim();
    const isAdvanced = action === 'harder';
    const isBeginner = action === 'easier';

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

    if (isBeginner) {
      questionText = `What is the primary function of ${cleanTopic}?`;
      options = ['Data Processing & Analytics', 'Hardware Power Management', 'Theme Color Generation', 'Disabling Authentication'];
      correct = options[0];
      explanation = `${cleanTopic} provides foundational mechanisms designed for structured technical operations and data management.`;
    } else if (isAdvanced) {
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

    const type = action === 'change_type'
      ? (currentQuestion.type === 'multiple_choice' ? 'type_answer' : 'multiple_choice')
      : currentQuestion.type;

    return {
      id: questionId,
      question: questionText,
      type,
      options: type === 'type_answer' ? [] : options,
      correctAnswer: correct,
      explanation,
      timeLimit: currentQuestion.timeLimit || 30,
      points: currentQuestion.points || 10,
    };
  }
}

export const aiQuizService = new AIQuizService();
