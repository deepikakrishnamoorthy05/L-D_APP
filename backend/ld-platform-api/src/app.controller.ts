import { Controller, Get } from '@nestjs/common';
import { DatabaseHealthService } from './database/database.module.js';

@Controller()
export class AppController {
  constructor(private readonly dbHealthService: DatabaseHealthService) {}

  @Get()
  getRoot() {
    return {
      application: 'Systech L&D Platform API',
      status: 'running',
    };
  }

  @Get('health')
  getHealth() {
    const dbInfo = this.dbHealthService.getHealthStatus();
    return {
      status: dbInfo.status,
      service: 'Backend API',
      database: dbInfo.database,
    };
  }
}