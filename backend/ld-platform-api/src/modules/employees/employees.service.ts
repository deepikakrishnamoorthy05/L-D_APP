import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';

export interface EmployeeRecord {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  team: string;
  track: 'BA' | 'DE' | 'Tools' | 'Other';
  designation: string;
  manager: string;
  location: string;
  skills: string[];
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  
  // In-Memory store for graceful operation prior to live Azure SQL DB connection
  private inMemoryEmployees: Map<string, EmployeeRecord> = new Map();

  async findAll(query: QueryEmployeeDto): Promise<EmployeeRecord[]> {
    let list = Array.from(this.inMemoryEmployees.values());

    if (query.track) {
      list = list.filter((e) => e.track.toLowerCase() === query.track?.toLowerCase());
    }

    if (query.status) {
      list = list.filter((e) => e.status.toLowerCase() === query.status?.toLowerCase());
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(s) ||
          e.email.toLowerCase().includes(s) ||
          e.employeeId.toLowerCase().includes(s)
      );
    }

    return list;
  }

  async findOne(id: string): Promise<EmployeeRecord> {
    const employee = this.inMemoryEmployees.get(id) || Array.from(this.inMemoryEmployees.values()).find(e => e.employeeId === id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID or EmployeeID "${id}" not found.`);
    }
    return employee;
  }

  async create(createDto: CreateEmployeeDto): Promise<EmployeeRecord> {
    const existing = Array.from(this.inMemoryEmployees.values()).find(
      (e) => e.employeeId === createDto.employeeId || e.email === createDto.email
    );

    if (existing) {
      throw new BadRequestException(`Employee with ID "${createDto.employeeId}" or Email "${createDto.email}" already exists.`);
    }

    const newRecord: EmployeeRecord = {
      id: `emp-uuid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: createDto.employeeId,
      name: createDto.name,
      email: createDto.email,
      department: createDto.department || 'Engineering',
      team: createDto.team || 'L&D Intelligence',
      track: createDto.track,
      designation: createDto.designation || 'Software Engineer',
      manager: createDto.manager || 'Unassigned',
      location: createDto.location || 'Remote',
      skills: createDto.skills || [],
      status: createDto.status || 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryEmployees.set(newRecord.id, newRecord);
    this.logger.log(`Created employee record: ${newRecord.employeeId} (${newRecord.name})`);
    return newRecord;
  }

  async update(id: string, updateDto: UpdateEmployeeDto): Promise<EmployeeRecord> {
    const existing = await this.findOne(id);
    
    const updated: EmployeeRecord = {
      ...existing,
      ...updateDto,
      updatedAt: new Date(),
    };

    this.inMemoryEmployees.set(existing.id, updated);
    this.logger.log(`Updated employee record: ${updated.employeeId}`);
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.findOne(id);
    this.inMemoryEmployees.delete(existing.id);
    this.logger.log(`Deleted employee record: ${existing.employeeId}`);
    return { success: true, message: `Employee "${existing.employeeId}" deleted successfully.` };
  }
}
