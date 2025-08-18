import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export const PAYMENT_METHODS = ['cod', 'bank_transfer', 'installment_plan'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export class CheckoutDto {
  @ApiProperty({
    description: 'Where to deliver the order',
    example: '123 Demo St, District 1, HCMC',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  shippingAddress!: string;

  @ApiProperty({
    description: 'How the user will pay',
    enum: PAYMENT_METHODS,
    example: 'cod',
  })
  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Optional contact phone for delivery issues',
    example: '+84 909 123 456',
  })
  @IsOptional()
  @IsPhoneNumber() // defaults to any region; you can use @IsPhoneNumber('VN') if you want strict VN
  phone?: string;

  @ApiPropertyOptional({
    description: 'Optional delivery notes',
    example: 'Leave at reception if I’m not home',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
