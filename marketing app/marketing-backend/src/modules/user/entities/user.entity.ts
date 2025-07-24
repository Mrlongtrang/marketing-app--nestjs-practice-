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
import { CartItem } from 'src/modules/cart/entities/cart.entities';

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
  @Column({ default: 'user' })
  role: string; // 'user' | 'admin'

  @ApiProperty()
  @Column({ unique: true })
  username: string;

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
  carts: any;

  @OneToMany(() => CartItem, (cart) => cart.user)
  cart: CartItem[];
}
