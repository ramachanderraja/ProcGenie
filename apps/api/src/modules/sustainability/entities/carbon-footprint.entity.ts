import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum EmissionScope {
  SCOPE_1 = 'scope_1',
  SCOPE_2 = 'scope_2',
  SCOPE_3 = 'scope_3',
}

@Entity('carbon_footprints')
@Index(['supplierId', 'tenantId'])
@Index(['reportingPeriod', 'tenantId'])
export class CarbonFootprint extends BaseEntity {
  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId?: string;

  @ApiProperty({ example: 'Dell Technologies' })
  @Column({ name: 'entity_name', type: 'varchar', length: 300 })
  entityName: string;

  @ApiProperty({ example: 'supplier', description: 'Type of entity: supplier, category, or organization' })
  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @ApiProperty({ enum: EmissionScope })
  @Column({ name: 'emission_scope', type: 'enum', enum: EmissionScope })
  emissionScope: EmissionScope;

  @ApiProperty({ example: 1250.5, description: 'CO2 emissions in metric tons' })
  @Column({ name: 'co2_emissions_tons', type: 'decimal', precision: 12, scale: 2 })
  co2EmissionsTons: number;

  @ApiProperty({ example: 'Q1 2025' })
  @Column({ name: 'reporting_period', type: 'varchar', length: 50 })
  reportingPeriod: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'energy_consumption_kwh', type: 'decimal', precision: 12, scale: 2, nullable: true })
  energyConsumptionKwh?: number;

  @Column({ name: 'renewable_energy_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  renewableEnergyPercentage?: number;

  @Column({ name: 'water_usage_liters', type: 'decimal', precision: 12, scale: 2, nullable: true })
  waterUsageLiters?: number;

  @Column({ name: 'waste_generated_tons', type: 'decimal', precision: 12, scale: 2, nullable: true })
  wasteGeneratedTons?: number;

  @Column({ name: 'offset_credits', type: 'decimal', precision: 12, scale: 2, nullable: true })
  offsetCredits?: number;

  @ApiProperty({ example: 'verified', description: 'Verification status' })
  @Column({ name: 'verification_status', type: 'varchar', length: 50, nullable: true })
  verificationStatus?: string;

  @Column({ name: 'verified_by', type: 'varchar', length: 200, nullable: true })
  verifiedBy?: string;

  @Column({ name: 'data_source', type: 'varchar', length: 200, nullable: true })
  dataSource?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
