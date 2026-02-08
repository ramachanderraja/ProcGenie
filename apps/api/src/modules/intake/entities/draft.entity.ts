import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('request_drafts')
export class Draft extends BaseEntity {
  @ApiProperty({ example: 'Untitled Request' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  title?: string;

  @ApiProperty({ description: 'Serialized draft form state' })
  @Column({ name: 'form_data', type: 'jsonb' })
  formData: Record<string, unknown>;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({ example: false })
  @Column({ name: 'is_auto_saved', type: 'boolean', default: true })
  isAutoSaved: boolean;

  @ApiProperty({ description: 'Step in the multi-step form', example: 2 })
  @Column({ name: 'current_step', type: 'integer', default: 1 })
  currentStep: number;
}
