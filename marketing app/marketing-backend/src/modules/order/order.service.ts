import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderSummaryDto } from './dto/order-summary.dto';
import { OrderResponseDto, OrderLineDto } from './dto/order.response';
import { Cart } from '../cart/entity/cart.entity';
import { CartItem } from '../cart/entity/cart-item.entity';
import { Product } from '../product/entity/product.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,

@InjectRepository(Order)private readonly orderRepo: Repository<Order>,
@InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
@InjectRepository(CartItem) private readonly cartItemRepo: Repository<CartItem>,
@InjectRepository(Product) private readonly productRepo: Repository<Product>,
@InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Helper: SUM the current cart total by userId using SQL:
   * SUM(ci.quantity * ci.unitPrice). Uses the relation join to avoid FK-name guessing.
   */
  private async getCartSumByUserId(userId: number): Promise<number> {
    const row = await this.cartItemRepo
      .createQueryBuilder('ci')
      .innerJoin('ci.cart', 'c')
      .select('COALESCE(SUM(ci.quantity * ci.unitPrice), 0)', 'sum')
      .where('c.userId = :userId', { userId })
      .getRawOne<{ sum: string }>();

    return Number(row?.sum ?? 0);
  }

  /**
   * POST /checkout
   * - Loads the user's cart and items
   * - Computes the order total in SQL
   * - Creates order + order_items (snapshot prices)
   * - Clears the cart
   * - Returns a compact DTO
   */
  async checkout(userId: number, dto: CheckoutDto): Promise<OrderResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      // 1) Load user (optional, but good for ownership checks / future use)
      const user = await manager.getRepository(User).findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      // 2) Load the cart for this user
      const cart = await manager.getRepository(Cart).findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (!cart) throw new BadRequestException('Cart not found');

      // 3) Load cart items (with product)
      const cartItems = await manager.getRepository(CartItem).find({
        where: { cart: { cartId: cart.cartId } },
        relations: ['product'],
        order: { id: 'ASC' },
      });
      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // 4) Compute total via SQL to stay consistent with cart logic
      const totalFromSql = await this.getCartSumByUserId(userId);

      // 5) Create the Order (snapshot total as a string if your column is DECIMAL)
      const order = manager.getRepository(Order).create({
        user,
        totalPrice: Number(totalFromSql.toFixed(2)),
        paymentMethod: dto.paymentMethod,
        shippingAddress: dto.shippingAddress,
        status: 'pending', 
      });
      await manager.getRepository(Order).save(order);

      // 6) Copy cart items -> order_items (snapshot unit/line totals)
      const orderItemsToSave = cartItems.map((ci) =>
        manager.getRepository(OrderItem).create({
          order,
          product: ci.product,
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,     // keep as-is to preserve DECIMAL precision
          totalPrice: ci.totalPrice,
        }),
      );
      const savedOrderItems = await manager.getRepository(OrderItem).save(orderItemsToSave);

      // 7) Clear cart (only items; keep the cart shell for the user)
      await manager.getRepository(CartItem).delete({ cart: { cartId: cart.cartId } });

      // 8) Build response DTO (numbers for the client)
      const itemsDto: OrderLineDto[] = savedOrderItems.map((oi) => ({
        productId: oi.product.id,
        name: oi.product.name,
        quantity: Number(oi.quantity),
        unitPrice: Number(oi.unitPrice),
        lineTotal: Number(oi.totalPrice),
      }));

      const response: OrderResponseDto = {
        orderId: order.id,
        totalPrice: Number(totalFromSql),
        items: itemsDto,
        paymentMethod: order.paymentMethod,
        shippingAddress: dto.shippingAddress,
        createdAt: order.createdAt.toISOString(),
      };
      return response;
    });
  }

async getOrdersForUser(userId: number): Promise<OrderSummaryDto[]> {
  const orders = await this.orderRepo.find({
    where: { user: { id: userId } },
    relations: ['items', 'items.product'],
    order: { createdAt: 'DESC' },
  });

  return orders.map((o) => ({
    orderId: o.id,
    totalPrice: Number(o.totalPrice),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((oi) => ({
      productId: oi.product.id,
      name: oi.product.name,
      quantity: Number(oi.quantity),
      unitPrice: Number(oi.unitPrice),      
    })),
    totalAmount: Number(o.totalPrice),
    itemCount: o.items.reduce((sum, oi) => sum + Number(oi.quantity), 0),
  }));
}
}


