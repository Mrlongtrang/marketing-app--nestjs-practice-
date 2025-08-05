import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { CartItem } from '../cart/entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { OrderSummaryDto } from './dto/order-summary.dto';
import { OrderDetailsDto, OrderItemDto } from './dto/order-detail.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async checkout(userId: number): Promise<OrderSummaryDto> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const cartItems = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    if (!cartItems.length) {
      throw new NotFoundException('Cart is empty');
    }

    // Create and save the order (without items)
    const order = this.orderRepo.create({
      user,
      totalAmount: 0,
      status: 'pending',
    });
    const savedOrder = await this.orderRepo.save(order);

    // Create order items and save them
    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const cartItem of cartItems) {
      const orderItem = this.orderItemRepo.create({
        order: savedOrder,
        product: cartItem.product,
        quantity: cartItem.quantity,
        unitPrice: cartItem.product.price,
        totalPrice: cartItem.product.price * cartItem.quantity,
      });
      total += orderItem.totalPrice;
      orderItems.push(orderItem);
    }

    await this.orderItemRepo.save(orderItems);

    // Update total amount
    savedOrder.totalAmount = total;
    await this.orderRepo.save(savedOrder);

    // Clear user's cart
    await this.cartRepo.remove(cartItems); // safer than delete

    return {
    orderId: savedOrder.id,
    status: savedOrder.status,
    totalAmount: savedOrder.totalAmount,
    itemCount: orderItems.length,
  };
  }

  async getOrdersForUser(userId: number): Promise<OrderDetailsDto[]> {
    const orders = await this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'], // important for FE
      order: { createdAt: 'DESC' },
    });
    return orders.map(order => this.mapToOrderDetailsDto(order));
  }

  private mapToOrderDetailsDto(order: Order): OrderDetailsDto {
  return {
    orderId: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    items: order.items?.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })) || [],
  };

  
}  
}
