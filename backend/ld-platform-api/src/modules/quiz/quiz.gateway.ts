import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { QuizService } from './quiz.service.js';
import { JoinSessionDto, SubmitAnswerDto } from './dto/quiz.dto.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(QuizGateway.name);

  constructor(private readonly quizService: QuizService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('quiz:join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinSessionDto
  ) {
    try {
      const { session, participant } = this.quizService.joinSession(payload, client.id);

      // Join Socket.IO room for this session
      const roomName = `session_${session.joinCode}`;
      client.join(roomName);
      client.join(`session_id_${session.id}`);

      this.logger.log(`Socket ${client.id} joined room ${roomName} as ${participant.employeeName}`);

      // Emit join confirmation to participant
      client.emit('quiz:joined', {
        success: true,
        sessionId: session.id,
        joinCode: session.joinCode,
        quizTitle: session.quizTitle,
        participant,
      });

      // Broadcast updated participant list to host & room
      this.server.to(roomName).emit('quiz:participant-joined', {
        sessionId: session.id,
        participantCount: session.participants.length,
        participants: session.participants.map((p) => ({
          id: p.id,
          employeeName: p.employeeName,
          employeeId: p.employeeId,
          score: p.score,
        })),
      });

      return { status: 'ok', participantId: participant.id };
    } catch (err: any) {
      client.emit('quiz:error', { message: err.message || 'Failed to join quiz session.' });
      return { status: 'error', message: err.message };
    }
  }

  @SubscribeMessage('quiz:start')
  handleStartQuiz(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string }
  ) {
    try {
      const session = this.quizService.getSessionById(payload.sessionId);
      session.status = 'Live';
      session.currentQuestionIndex = 0;

      const roomName = `session_${session.joinCode}`;
      this.server.to(roomName).emit('quiz:started', {
        sessionId: session.id,
        quizTitle: session.quizTitle,
        totalQuestions: this.quizService.getQuizById(session.quizId).questions.length,
      });

      // Trigger question 1 start automatically
      this.broadcastQuestion(session.id, 0);
    } catch (err: any) {
      client.emit('quiz:error', { message: err.message });
    }
  }

  @SubscribeMessage('quiz:question-start')
  handleQuestionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; questionIndex: number }
  ) {
    this.broadcastQuestion(payload.sessionId, payload.questionIndex);
  }

  private broadcastQuestion(sessionId: string, questionIndex: number) {
    try {
      const session = this.quizService.getSessionById(sessionId);
      const quiz = this.quizService.getQuizById(session.quizId);

      if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
        return;
      }

      session.currentQuestionIndex = questionIndex;
      session.status = 'Live';

      // Record question start timestamp on backend for timing validation
      this.quizService.recordQuestionStartTime(session.id, questionIndex);

      const questionObj = quiz.questions[questionIndex];

      // SECURITY: Exclude correctAnswer & explanation from payload sent to participants
      const participantQuestionPayload = {
        sessionId: session.id,
        questionIndex,
        totalQuestions: quiz.questions.length,
        questionId: questionObj.id,
        question: questionObj.question,
        options: questionObj.options,
        timeLimit: questionObj.timeLimit || 30,
        points: questionObj.points || 1000,
      };

      const roomName = `session_${session.joinCode}`;
      this.server.to(roomName).emit('quiz:question-start', participantQuestionPayload);

      this.logger.log(`Broadcast Question ${questionIndex + 1}/${quiz.questions.length} to room ${roomName}`);
    } catch (err: any) {
      this.logger.error(`Failed to broadcast question: ${err.message}`);
    }
  }

  @SubscribeMessage('quiz:answer-submit')
  handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubmitAnswerDto
  ) {
    try {
      const { response, responseCount, totalParticipants } = this.quizService.submitAnswer(payload);

      // Respond to participant
      client.emit('quiz:answer-received', {
        success: true,
        questionId: payload.questionId,
        pointsEarned: response.pointsEarned,
      });

      // Emit live response count to host & room
      const session = this.quizService.getSessionById(payload.sessionId);
      const roomName = `session_${session.joinCode}`;
      this.server.to(roomName).emit('quiz:response-count', {
        questionId: payload.questionId,
        responseCount,
        totalParticipants,
      });
    } catch (err: any) {
      client.emit('quiz:error', { message: err.message });
    }
  }

  @SubscribeMessage('quiz:reveal-answer')
  handleRevealAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; questionId: string }
  ) {
    try {
      const session = this.quizService.getSessionById(payload.sessionId);
      const reveal = this.quizService.revealAnswer(payload.sessionId, payload.questionId);

      const roomName = `session_${session.joinCode}`;
      this.server.to(roomName).emit('quiz:reveal-answer', {
        questionId: payload.questionId,
        correctAnswer: reveal.correctAnswer,
        explanation: reveal.explanation,
        distribution: reveal.distribution,
      });
    } catch (err: any) {
      client.emit('quiz:error', { message: err.message });
    }
  }

  @SubscribeMessage('quiz:leaderboard')
  handleLeaderboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string }
  ) {
    try {
      const session = this.quizService.getSessionById(payload.sessionId);
      const leaderboard = this.quizService.getLeaderboard(payload.sessionId);

      const roomName = `session_${session.joinCode}`;
      this.server.to(roomName).emit('quiz:leaderboard', {
        sessionId: session.id,
        leaderboard: leaderboard.map((p) => ({
          rank: p.rank,
          id: p.id,
          employeeName: p.employeeName,
          employeeId: p.employeeId,
          score: p.score,
          correctAnswersCount: p.correctAnswersCount,
          totalQuestions: p.totalQuestions,
          totalTimeMs: p.totalTimeMs,
          formattedTime: p.formattedTime,
          isTieBreakerWon: p.isTieBreakerWon,
          tieBreakerReason: p.tieBreakerReason,
        })),
      });
    } catch (err: any) {
      client.emit('quiz:error', { message: err.message });
    }
  }

  @SubscribeMessage('quiz:next-question')
  handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string }
  ) {
    try {
      const session = this.quizService.getSessionById(payload.sessionId);
      const quiz = this.quizService.getQuizById(session.quizId);

      const nextIdx = session.currentQuestionIndex + 1;
      if (nextIdx < quiz.questions.length) {
        this.broadcastQuestion(session.id, nextIdx);
      } else {
        this.handleEndQuiz(client, { sessionId: session.id });
      }
    } catch (err: any) {
      client.emit('quiz:error', { message: err.message });
    }
  }

  @SubscribeMessage('quiz:end')
  handleEndQuiz(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string }
  ) {
    try {
      const summary = this.quizService.endSession(payload.sessionId);
      const session = this.quizService.getSessionById(payload.sessionId);

      const roomName = `session_${session.joinCode}`;
      this.server.to(roomName).emit('quiz:ended', {
        sessionId: session.id,
        summary,
      });
    } catch (err: any) {
      client.emit('quiz:error', { message: err.message });
    }
  }
}
