import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EmployeesModule } from './modules/employees/employees.module.js';
import { TrainingModule } from './modules/training/training.module.js';
import { SessionsModule } from './modules/sessions/sessions.module.js';
import { AssessmentsModule } from './modules/assessments/assessments.module.js';
import { FeedbackModule } from './modules/feedback/feedback.module.js';
import { CertificationsModule } from './modules/certifications/certifications.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { QuizModule } from './modules/quiz/quiz.module.js';
import { WeeklyDashboardModule } from './modules/weekly-dashboard/weekly-dashboard.module.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    EmployeesModule,
    TrainingModule,
    SessionsModule,
    AssessmentsModule,
    FeedbackModule,
    CertificationsModule,
    AiModule,
    QuizModule,
    WeeklyDashboardModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}