import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { CartItem } from '../cart/entity/cart.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async checkout(userId: number): Promise<Order> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const cartItems = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    if (!cartItems.length) {
      throw new NotFoundException('Cart is empty');
    }

    const order = this.orderRepo.create({
      user,
      totalAmount: 0,
      items: [],
      status: 'pending',
    });

    let total = 0;

    for (const cartItem of cartItems) {
      const orderItem = this.orderItemRepo.create({
        order,
        product: cartItem.product,
        quantity: cartItem.quantity,
        unitPrice: cartItem.product.price,
        totalPrice: cartItem.product.price * cartItem.quantity,
      });
      total += orderItem.totalPrice;
      order.items.push(orderItem);
    }

    order.totalAmount = total;

    const savedOrder = await this.orderRepo.save(order);

    await this.cartRepo.delete({ user: { id: userId } });

    return savedOrder;
  }

  async getOrdersForUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
