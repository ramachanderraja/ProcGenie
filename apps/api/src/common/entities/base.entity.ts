import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @ApiProperty({ description: 'Unique identifier (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete timestamp (null if active)', required: false })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'User ID who created this record', required: false })
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ApiProperty({ description: 'Tenant identifier for multi-tenancy' })
  @Column({ name: 'tenant_id', type: 'varchar', length: 100, default: 'default' })
  tenantId: string;
}
