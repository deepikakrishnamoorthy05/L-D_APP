import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { WeeklyDashboardService, WeeklyDashboardRecord } from './weekly-dashboard.service.js';

@Controller('dashboard/weekly')
export class WeeklyDashboardController {
  constructor(private readonly weeklyDashboardService: WeeklyDashboardService) {}

  @Get()
  getWeeklySummary(@Query('weekDate') weekDate?: string) {
    return this.weeklyDashboardService.getWeeklyDashboard(weekDate);
  }

  @Get('weeks')
  getAvailableWeeks() {
    return this.weeklyDashboardService.getAvailableWeeks();
  }

  @Post()
  saveWeeklyDashboard(@Body() body: Record<string, any>) {
    return this.weeklyDashboardService.saveWeeklyDashboard(body as WeeklyDashboardRecord);
  }
}
