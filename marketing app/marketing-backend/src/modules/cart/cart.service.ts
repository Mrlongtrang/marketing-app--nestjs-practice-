import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart.entities';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateCartItemDto, userId: number) {
    // ✅ load relations
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // ✅ create with cartId auto-generated
    const item = this.cartRepo.create({
      quantity: dto.quantity,
      totalPrice: product.price * dto.quantity,
      user,
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
