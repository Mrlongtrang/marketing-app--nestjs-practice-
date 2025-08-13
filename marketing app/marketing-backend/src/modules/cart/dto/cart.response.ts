// src/modules/cart/dto/cart.response.ts
export interface CartLineDto {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartResponseDto {
  cartId: number;
  totalPrice: number;
  items: CartLineDto[];
}
