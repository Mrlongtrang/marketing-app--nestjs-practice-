import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entity/user.entity';
import { Product } from '../../product/entity/product.entity';

@Entity('cart')
export class CartItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  cartId: number;

  @ApiProperty()
  @Column()
  quantity: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @ApiProperty()
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, (product) => product.cart, { onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
