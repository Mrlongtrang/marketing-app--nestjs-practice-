import { Controller, Injectable, NotFoundException, UseGuards, Req, Body, UnauthorizedException, Get, Post, HttpCode, Delete, ParseIntPipe, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/common/types/express';
@Injectable()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  cartService: any;
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}
  
  @Get('my-cart')
  async getMycart(@Req() req: AuthenticatedRequest) {
  return this.cartService.create(req.user.id);
  }

  @Post('add')
  async addToCart(
  @Body() dto: CreateCartItemDto,     // DTO with productId and quantity
  @Req() req: AuthenticatedRequest    // Custom request with user.id
) {
// 🔹 Step 1: get current user's ID from request
  const userId = req.user.id;
  console.log( '[cartcontroller] Recive userId =', userId);    
  // 🔹 Step 2: fetch product to make sure it exists
  const product = await this.productRepo.findOne({
    where: { id: dto.productId },
  });
  if (!product) {
    throw new NotFoundException('Product not found');
  }
  // 🔹 Step 3: check if the product is already in the user's cart
  const existingCartItem = await this.cartRepo.findOne({
    where: {
      user: { id: userId },
      product: { id: dto.productId },
    },
    relations: ['product'],
  });

  if (existingCartItem) {
    // 🔹 Step 4a: If exists, update quantity & totalPrice
    existingCartItem.quantity += dto.quantity;
    existingCartItem.totalPrice = existingCartItem.quantity * product.price;
    return this.cartRepo.save(existingCartItem);
  }
  // 🔹 Step 4b: If not exists, create new cart item
  const newCartItem = this.cartRepo.create({
    user: { id: userId },
    product,
    quantity: dto.quantity,
    unitPrice: product.price,
    totalPrice: dto.quantity * product.price,
  });
  return this.cartRepo.save(newCartItem);
  
}

  @Delete ('remove/:productId')
  @HttpCode(204)
  async removeFromCart( 
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.cartService.remove(productId, userId);
  }
}
