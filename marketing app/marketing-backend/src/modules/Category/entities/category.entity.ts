/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('categories')
export class Category {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description: string;

  // ✅ Timestamp fields
  @ApiProperty({ description: 'When the category was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the category was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When the category was deleted', required: false })
  @DeleteDateColumn()
  deletedAt?: Date;
}
