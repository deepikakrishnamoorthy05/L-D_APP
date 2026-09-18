import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule, DatabaseHealthService } from './database/database.module.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app info', () => {
      expect(appController.getRoot()).toEqual({
        application: 'Systech L&D Platform API',
        status: 'running',
      });
    });

    it('should return health status', () => {
      expect(appController.getHealth()).toEqual({
        status: 'degraded',
        service: 'Backend API',
        database: 'not configured',
      });
    });
  });
});
