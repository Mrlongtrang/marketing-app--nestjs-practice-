import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Product } from '../product/entity/product.entity';
import { User } from '../user/entity/user.entity';
import { CartItem } from '../cart/entity/cart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User, CartItem]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
