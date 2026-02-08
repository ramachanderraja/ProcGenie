import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('request_templates')
export class Template extends BaseEntity {
  @ApiProperty({ example: 'Standard IT Equipment Request' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ example: 'Template for requesting standard IT hardware' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: 'goods' })
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @ApiProperty({ description: 'Template form structure and default values' })
  @Column({ name: 'template_data', type: 'jsonb' })
  templateData: Record<string, unknown>;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ example: 42 })
  @Column({ name: 'usage_count', type: 'integer', default: 0 })
  usageCount: number;
}
