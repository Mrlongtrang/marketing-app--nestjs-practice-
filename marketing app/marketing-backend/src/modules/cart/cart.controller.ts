import { Controller, Injectable, NotFoundException, UseGuards, Req, Body, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request } from 'express';
@Injectable()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(
    @Body() dto: CreateCartItemDto,
    @Req() req: Request,
  ) {
    if (!req.user || typeof req.user !== 'object' || !('id' in req.user)) {
  throw new UnauthorizedException('User not authenticated');
}
    const userId = (req.user as { id: number}).id;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // create with cartId auto-generated
    const item = this.cartRepo.create({
      quantity: dto.quantity,
      totalPrice: product.price * dto.quantity,
      userId,
      product,
    });
    return this.cartRepo.save(item);
  }

  findAll(options: { skip: number; take: number }) {
    return this.cartRepo.find({
      skip: options.skip,
      take: options.take,
      relations: ['user', 'product'],
    });
  }

  async update(cartId: number, dto: UpdateCartItemDto) {
    const item = await this.cartRepo.findOne({
      where: { cartId },
      relations: ['product'],
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity !== undefined) {
      item.quantity = dto.quantity;
      item.totalPrice = item.product.price * dto.quantity;
    }

    return this.cartRepo.save(item);
  }

  async remove(cartId: number) {
    const item = await this.cartRepo.findOne({ where: { cartId } });
    if (!item) throw new NotFoundException('Cart item not found');
    return this.cartRepo.remove(item);
  }
}
