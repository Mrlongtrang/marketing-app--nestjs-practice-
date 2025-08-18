export interface OrderLineDto {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponseDto {
  orderId: number;
  totalPrice: number;
  items: OrderLineDto[];
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
}
