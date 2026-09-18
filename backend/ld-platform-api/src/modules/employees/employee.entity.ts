import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type EmployeeTrack = 'BA' | 'DE' | 'Tools' | 'Other';
export type EmployeeStatus = 'Active' | 'Inactive';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  employeeId!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ nullable: true })
  team!: string;

  @Column({ type: 'varchar', default: 'Other' })
  track!: EmployeeTrack;

  @Column({ nullable: true })
  designation!: string;

  @Column({ nullable: true })
  manager!: string;

  @Column({ nullable: true })
  location!: string;

  @Column('simple-array', { nullable: true })
  skills!: string[];

  @Column({ type: 'varchar', default: 'Active' })
  status!: EmployeeStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
