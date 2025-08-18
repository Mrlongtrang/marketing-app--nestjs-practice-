import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.orders, { eager: true })
  user: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 255 })
   shippingAddress: string;

  @Column({ type: 'varchar', length: 255 })
  paymentMethod: string;

  @Column({ default: 'pending' }) // optional: use enum instead
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
