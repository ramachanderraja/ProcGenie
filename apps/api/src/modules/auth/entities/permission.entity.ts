import { Entity, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @ApiProperty({ example: 'intake:create' })
  @Column({ type: 'varchar', length: 200, unique: true })
  name: string;

  @ApiProperty({ example: 'Create Intake Request' })
  @Column({ name: 'display_name', type: 'varchar', length: 200 })
  displayName: string;

  @ApiProperty({ example: 'intake' })
  @Column({ type: 'varchar', length: 100 })
  module: string;

  @ApiProperty({ example: 'create' })
  @Column({ type: 'varchar', length: 50 })
  action: string;

  @ApiProperty({ example: 'Allows user to create new intake requests' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
