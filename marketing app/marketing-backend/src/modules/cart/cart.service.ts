import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart-item.entity';
import { Cart } from './entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Cart)
    private readonly cartEntityRepo: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async addSingleToCart(dto: CreateCartItemDto, userId: number) {
  // 1. Load the product
  const product = await this.productRepo.findOne({
    where: { id: dto.productId },
  });
  if (!product) {
    throw new NotFoundException(`Product with ID ${dto.productId} not found`);
  }

  // 2. Find the user's cart
  const cart = await this.cartEntityRepo.findOne({
    where: { user: { id: userId } },
  });
  if (!cart) {
    throw new NotFoundException(`Cart not found for user ${userId}`);
  }

  // 3. Check if item already exists in the user's cart
  const existingItem = await this.cartRepo.findOne({
    where: {
      cart: { cartId: cart.cartId },
      product: { id: dto.productId },
    },
    relations: ['cart', 'product'],
  });

  // 4. If it exists → update
  if (existingItem) {
    existingItem.quantity += dto.quantity;
    existingItem.totalPrice = existingItem.quantity * product.price;
    return this.cartRepo.save(existingItem);
  }

  // 5. Else create a new CartItem
  const newItem = this.cartRepo.create({
    cart: cart,
    product: product,
    quantity: dto.quantity,
    unitPrice: product.price,
    totalPrice: dto.quantity * product.price,
  });

  return this.cartRepo.save(newItem);
}

// add multi category items to cart
async addMultipleToCart(dtos: CreateCartItemDto[], userId: number) {
  const results:  CartItem[] = [];
  for (const dto of dtos) {
    const result = await this.addSingleToCart(dto, userId);
    results.push(result);
  }

  return results;
}



  async update(cartId: number, dto: UpdateCartItemDto) {
    const item = await this.cartRepo.findOne({
      where: { cart: {
       cartId: cartId,
      },
    },
      relations: ['product', 'cart'],
    });
    if (!item) throw new NotFoundException('Cart item not found');

      item.quantity = dto.quantity;
      item.totalPrice = item.product.price * dto.quantity;   

    return this.cartRepo.save(item);
  }

  async findcart(userId: number) {
    return this.cartRepo.find({
  where: {
    cart: {
      user: {
        id: userId,
      },
    },
  },
  relations: ['product', 'cart', 'cart.user'], // needed to enable deep filter
});
  }



// remove individual cart item
 async remove(userId: number, productId: number): Promise<void> {
  const item = await this.cartRepo.findOne({
    where: {
      cart: {
        user: { id: userId },
      },
      product: {
        id: productId,
      },
    },
    relations: ['cart', 'cart.user', 'product'], // make sure these are loaded
  });

  if (!item) {
    throw new NotFoundException('Cart item not found');
  }

  await this.cartRepo.remove(item);
}
}
