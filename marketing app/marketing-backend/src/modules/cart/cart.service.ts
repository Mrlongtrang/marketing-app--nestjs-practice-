import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart.entities';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,
  ) {}

  async create(dto: CreateCartItemDto, userId: number) {
    const item = this.cartRepo.create({ ...dto, userId });
    return this.cartRepo.save(item);
  }

  findAll(options: { skip: number; take: number }) {
    return this.cartRepo.find(options);
  }

  async update(id: number, dto: UpdateCartItemDto) {
    const item = await this.cartRepo.findOne({ where: { cartId: id } });
    if (!item) throw new NotFoundException('Cart item not found');
    Object.assign(item, dto);
    return this.cartRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.cartRepo.findOne({ where: { cartId: id } });
    if (!item) throw new NotFoundException('Cart item not found');
    return this.cartRepo.remove(item);
  }
}
