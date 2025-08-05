// src/modules/Order/dto/order-details.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../entity/order.entity'; // adjust if needed

export class OrderItemDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;
}

export class OrderDetailsDto {
  @ApiProperty()
  orderId: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];

  @ApiProperty()
  createdAt: Date;
}
