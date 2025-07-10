import { IsEmail, IsNotEmpty } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ nullable: true, type: 'datetime' })
  verificationTokenExpires: Date | null;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'datetime' })
  resetPasswordTokenExpires: Date;
}
