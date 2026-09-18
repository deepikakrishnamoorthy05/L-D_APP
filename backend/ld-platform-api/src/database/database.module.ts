import { Module, Logger, Global, Optional, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseHealthService {
  private isConnected = false;
  private isConfigured = false;
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(@Optional() private configService?: ConfigService) {
    const host = this.configService?.get<string>('DB_HOST') || process.env.DB_HOST;
    const database = this.configService?.get<string>('DB_DATABASE') || process.env.DB_DATABASE;
    
    if (host && database && host.trim() !== '' && database.trim() !== '') {
      this.isConfigured = true;
      this.logger.log(`Database configured for host: ${host}, database: ${database}`);
    } else {
      this.isConfigured = false;
      this.logger.warn(`Azure SQL Database is not configured. Missing DB_HOST or DB_DATABASE environment variables.`);
    }
  }

  getHealthStatus() {
    const host = this.configService?.get<string>('DB_HOST') || process.env.DB_HOST;
    const database = this.configService?.get<string>('DB_DATABASE') || process.env.DB_DATABASE;
    this.isConfigured = !!(host && database && host.trim() !== '' && database.trim() !== '');

    if (!this.isConfigured) {
      return {
        status: 'degraded',
        database: 'not configured',
        message: 'DB_HOST / DB_DATABASE environment variables are not set.',
      };
    }

    return {
      status: this.isConnected ? 'success' : 'degraded',
      database: this.isConnected ? 'connected' : 'configured (pending connection)',
    };
  }

  setConnectedStatus(status: boolean) {
    this.isConnected = status;
  }

  isDbConfigured(): boolean {
    return this.isConfigured;
  }
}

@Global()
@Module({
  providers: [DatabaseHealthService],
  exports: [DatabaseHealthService],
})
export class DatabaseModule {}
