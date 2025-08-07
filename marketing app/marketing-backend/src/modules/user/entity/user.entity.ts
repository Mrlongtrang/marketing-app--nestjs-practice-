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
import { Cart } from '../../cart/entity/cart.entity';
import { Order as OrderEntity } from 'src/modules/order/entity/order.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
   @Column({
    type: 'enum',
    enum: ['user', 'admin'], // you can add more roles if needed
    default: 'user',
   })
   role: 'user' | 'admin';


  //  timestamps
  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ required: false })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  verificationToken?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'datetime', nullable: true })
  verificationTokenExpires?: Date | null;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'datetime', nullable: true })
  resetPasswordTokenExpires: Date | null;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => OrderEntity, order => order.user)
  orders: OrderEntity[];

}
