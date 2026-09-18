import { IsOptional, IsString } from 'class-validator';

export class QueryEmployeeDto {
  @IsOptional()
  @IsString()
  track?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
