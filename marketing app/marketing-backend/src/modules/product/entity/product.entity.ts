import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from '../../Category/entity/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from '../../cart/entity/cart.entity';

@Entity('products')
export class Product {
  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  category: Category;

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
  carts: any;

  @OneToMany(() => CartItem, (CartItem) => CartItem.product)
  cart: CartItem[];
  finalPrice: number;
  discountPercent: number;
}
