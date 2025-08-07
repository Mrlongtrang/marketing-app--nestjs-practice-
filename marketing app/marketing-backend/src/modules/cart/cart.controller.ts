import { Controller, Injectable, NotFoundException, UseGuards, Req, Body, UnauthorizedException, Get, Post, HttpCode, Delete, ParseIntPipe, Param, ParseArrayPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart-item.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/common/types/express';
@Injectable()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(
    private readonly CartService: CartService,

    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

@Post('add')
async addToCart(
  @Body(new ParseArrayPipe({ items: CreateCartItemDto, optional: true })) body: CreateCartItemDto[] | CreateCartItemDto,
  @Req() req: AuthenticatedRequest
) {
  const userId = req.user.id;
  console.log('[cartcontroller] Recive userId =', userId);

  if (Array.isArray(body)) {
    return this.CartService.addMultipleToCart(body, userId);
  } else {
    return this.CartService.addSingleToCart(body, userId);
  }
}


@Get('my-cart')
async getMyCart(@Req() req: AuthenticatedRequest) {
  const userId = req.user.id;
  console.log('[cartController] Getting cart for userId =', userId);
  return this.CartService.findcart(userId);
}


  @Delete ('remove/:productId')
  @HttpCode(204)
  async removeFromCart( 
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.CartService.remove(productId, userId);
  }
}
