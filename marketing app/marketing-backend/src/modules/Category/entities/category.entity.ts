/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/modules/product/entities/product.entity';

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
  product: any;

  @OneToMany(() => Product, (product) => product.category)
products: Product[];

}
