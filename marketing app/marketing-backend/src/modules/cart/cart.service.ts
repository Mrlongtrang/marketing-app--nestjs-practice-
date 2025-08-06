import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
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

    //  load relations FK key
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    //  create with cartId auto-generated
    const CartItem = this.cartRepo.create({
      quantity: dto.quantity,
      unitPrice: product.price,
      totalPrice: product.price * dto.quantity,
      user: { id: userId },
      product,
    });
    return this.cartRepo.save(CartItem);
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

      item.quantity = dto.quantity;
      item.totalPrice = item.product.price * dto.quantity;   

    return this.cartRepo.save(item);
  }

  async findcart(userId: number) {
  return this.cartRepo.find({
    where: {
      user: { id: userId },
    },
    relations: ['product'], // include product info if needed
  });
}


// remove individual cart item
  async remove(userId: number, productId: number): Promise<void>  {
    const item = await this.cartRepo.findOne({ 
      where: {
         user: {id: userId },
         product:{ id: productId },
         }
         });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartRepo.remove(item);
  }
}
