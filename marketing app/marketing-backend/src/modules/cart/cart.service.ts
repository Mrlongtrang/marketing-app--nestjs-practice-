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

  async addMultipleToCart(dtos: CreateCartItemDto[], userId: number) {
  // 1) load (or create) the user's Cart
  let cart = await this.cartEntityRepo.findOne({
    where: { user: { id: userId } },
  });
  if (!cart) cart = await this.cartEntityRepo.save(this.cartEntityRepo.create({ user: { id: userId } }));

  const results: CartItem[] = [];
  for (const dto of dtos) {
    // 2) verify product exists
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    // 3) upsert CartItem (merge quantity if same product already in cart)
    const existing = await this.cartRepo.findOne({
      where: { cart: { cartId: cart.cartId }, product: { id: dto.productId } },
      relations: ['product', 'cart'],
    });

    if (existing) {
      existing.quantity += dto.quantity;
      existing.totalPrice = existing.quantity * existing.product.price;
      results.push(await this.cartRepo.save(existing));
      continue;
    }

    const newItem = this.cartRepo.create({
      cart,
      product,
      quantity: dto.quantity,
      unitPrice: product.price,
      totalPrice: dto.quantity * product.price,
    });
    results.push(await this.cartRepo.save(newItem));
  }
  return results; // array even if length === 1
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
