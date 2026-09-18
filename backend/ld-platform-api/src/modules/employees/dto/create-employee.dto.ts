import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  team?: string;

  @IsEnum(['BA', 'DE', 'Tools', 'Other'], {
    message: 'Track must be one of: BA, DE, Tools, Other',
  })
  @IsNotEmpty()
  track!: 'BA' | 'DE' | 'Tools' | 'Other';

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

  @IsEnum(['Active', 'Inactive'], {
    message: 'Status must be Active or Inactive',
  })
  @IsOptional()
  status?: 'Active' | 'Inactive';
}
