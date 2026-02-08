import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @ApiProperty({ example: 'procurement_manager' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({ example: 'Procurement Manager' })
  @Column({ name: 'display_name', type: 'varchar', length: 200 })
  displayName: string;

  @ApiProperty({ example: 'Manages procurement operations and approvals' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_system_role', type: 'boolean', default: false })
  isSystemRole: boolean;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ApiProperty({ type: () => [Permission] })
  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
