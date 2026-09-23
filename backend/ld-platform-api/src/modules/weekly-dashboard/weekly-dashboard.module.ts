import { Module } from '@nestjs/common';
import { WeeklyDashboardController } from './weekly-dashboard.controller.js';
import { WeeklyDashboardService } from './weekly-dashboard.service.js';

@Module({
  controllers: [WeeklyDashboardController],
  providers: [WeeklyDashboardService],
  exports: [WeeklyDashboardService],
})
export class WeeklyDashboardModule {}
