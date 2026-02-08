import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from './role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ example: 'john.doe@acme.com' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({ example: 'John' })
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ example: 'Procurement Manager' })
  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @ApiProperty({ example: 'Procurement' })
  @Column({ type: 'varchar', length: 200, nullable: true })
  department?: string;

  @ApiProperty({ example: '+1-555-0123' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ example: 'https://storage.example.com/avatars/john.jpg' })
  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @ApiProperty({ enum: UserStatus })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @ApiProperty({ example: false })
  @Column({ name: 'is_sso_user', type: 'boolean', default: false })
  isSsoUser: boolean;

  @ApiProperty({ example: null })
  @Column({ name: 'azure_ad_id', type: 'varchar', length: 255, nullable: true })
  azureAdId?: string;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Exclude()
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 500, nullable: true })
  refreshTokenHash?: string;

  @ApiProperty({ type: () => [Role] })
  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get roleNames(): string[] {
    return this.roles?.map((r) => r.name) || [];
  }
}
