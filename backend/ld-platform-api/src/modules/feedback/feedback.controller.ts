import { Body, Controller, ForbiddenException, Get, Headers, Post } from '@nestjs/common';

@Controller('feedback')
export class FeedbackController {
  private readonly ldReviews: Record<string, unknown>[] = [];

  private assertLdAccess(role?: string) {
    if (!['ADMIN', 'LD_ADMIN'].includes((role || '').toUpperCase())) {
      throw new ForbiddenException('L&D feedback is restricted to L&D administrators.');
    }
  }

  @Get('ld')
  getLdFeedback(@Headers('x-user-role') role?: string) {
    this.assertLdAccess(role);
    return this.ldReviews;
  }

  @Post('ld')
  createLdFeedback(@Headers('x-user-role') role: string | undefined, @Body() body: Record<string, unknown>) {
    this.assertLdAccess(role);
    const record = { ...body, id: `ld-fb-${Date.now()}`, submittedAt: new Date().toISOString() };
    this.ldReviews.unshift(record);
    return record;
  }
}
