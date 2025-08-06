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

  async addSingleToCart(dto: CreateCartItemDto, userId: number) {
  // 1. Find the product
  const product = await this.productRepo.findOne({
    where: { id: dto.productId },
  });
  if (!product) {
    throw new NotFoundException(`Product with ID ${dto.productId} not found`);
  }

  // 2. Check if item already in cart
  const existingItem = await this.cartRepo.findOne({
    where: {
      user: { id: userId },
      product: { id: dto.productId },
    },
    relations: ['user', 'product'],
  });

  // 3. If it exists → update quantity & price
  if (existingItem) {
    existingItem.quantity += dto.quantity;
    existingItem.totalPrice = existingItem.quantity * product.price;
    return this.cartRepo.save(existingItem);
  }

  // 4. Else → create new cart item with FK user + product
  const newItem = this.cartRepo.create({
    user: { id: userId }, // FK binding here
    product: product,
    quantity: dto.quantity,
    unitPrice: product.price,
    totalPrice: dto.quantity * product.price,
  });

  return this.cartRepo.save(newItem);
}
// add multi category items to cart
async addMultipleToCart(dtos: CreateCartItemDto[], userId: number) {
  const results: CartItem[] = [];
  for (const dto of dtos) {
    const result = await this.addSingleToCart(dto, userId);
    results.push(result);
  }

  return results;
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
