import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description: string;

  // Timestamp fields
  @ApiProperty({ description: 'When the product was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the product was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When the product was deleted', required: false })
  @DeleteDateColumn()
  deletedAt?: Date;
}
