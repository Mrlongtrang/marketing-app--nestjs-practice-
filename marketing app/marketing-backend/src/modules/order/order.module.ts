import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Product } from '../product/entity/product.entity';
import { User } from '../user/entity/user.entity';
import { Cart } from '../cart/entity/cart.entity';
import { OrderItem } from './entity/order-item.entity';
import { Category }  from '../category/entity/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User, Cart, Category]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
