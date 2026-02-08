import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('connectors')
@Index(['connectorCode'], { unique: true })
export class Connector extends BaseEntity {
  @ApiProperty({ example: 'sap_s4hana' })
  @Column({ name: 'connector_code', type: 'varchar', length: 100, unique: true })
  connectorCode: string;

  @ApiProperty({ example: 'SAP S/4HANA' })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({ example: 'Enterprise ERP integration with SAP S/4HANA for procurement data sync' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: 'erp' })
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @ApiProperty({ example: 'SAP' })
  @Column({ type: 'varchar', length: 200 })
  vendor: string;

  @ApiProperty({ example: '2.1.0' })
  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl?: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ name: 'supported_entities', type: 'text', array: true, nullable: true })
  supportedEntities?: string[];

  @Column({ name: 'auth_types', type: 'text', array: true, nullable: true })
  authTypes?: string[];

  @Column({ name: 'config_schema', type: 'jsonb', nullable: true })
  configSchema?: Record<string, unknown>;

  @Column({ name: 'documentation_url', type: 'varchar', length: 500, nullable: true })
  documentationUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
