import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cart')
export class CartItem {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  cartId: number;

  @ApiProperty()
  @Column()
  productId: number;

  @ApiProperty()
  @Column()
  quantity: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @ApiProperty()
  @Column()
  userId: number;
}
