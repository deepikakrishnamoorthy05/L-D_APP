import { IsString, IsEmail, IsEnum, IsOptional, IsArray } from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  team?: string;

  @IsEnum(['BA', 'DE', 'Tools', 'Other'])
  @IsOptional()
  track?: 'BA' | 'DE' | 'Tools' | 'Other';

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  manager?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsEnum(['Active', 'Inactive'])
  @IsOptional()
  status?: 'Active' | 'Inactive';
}
