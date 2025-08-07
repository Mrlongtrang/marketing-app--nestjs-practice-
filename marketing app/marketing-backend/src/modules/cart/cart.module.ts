import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entity/cart-item.entity';
import { Cart } from './entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Cart, User, Product])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
