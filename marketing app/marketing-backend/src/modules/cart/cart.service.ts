import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart-item.entity';
import { Cart } from './entity/cart.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { CartResponseDto, CartLineDto } from './dto/cart.response';

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

   // helper: ensure a cart exists for the user
  private async ensureCart(userId: number): Promise<Cart> {
    let cart = await this.cartEntityRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!cart) {
      cart = this.cartEntityRepo.create({ user: { id: userId } as unknown as any }); // only here we must pass a stub; if you have a User entity instance, use it instead.
      cart = await this.cartEntityRepo.save(cart);
    }
    return cart;
  }


  private async getCartSumById(cartId: number): Promise<number> {
    const row = await this.cartRepo
      .createQueryBuilder('ci')
      .innerJoin('ci.cart', 'c')  
      .select('COALESCE(SUM(ci.quantity * ci.unitPrice), 0)', 'sum')
      .where('c.cartId = :cartId', { cartId  })   // if your join col is different, change here
      .getRawOne<{sum: string}>();

    return Number(row?.sum?? 0 );
  }

  async addMultipleToCart(dtos: CreateCartItemDto[], userId: number): Promise<CartResponseDto> {
    const cart = await this.ensureCart(userId);
    const results: CartItem[] = [];
    for (const dto of dtos) {
      // 1) product exists
      const product = await this.productRepo.findOne({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

      // 2) merge quantity if same product already in cart
      const existing = await this.cartRepo.findOne({
        where: { cart: { cartId: cart.cartId }, product: { id: dto.productId } },
        relations: ['product', 'cart'],
      });

      if (existing) {
        existing.quantity = Number(existing.quantity) + Number(dto.quantity);
        existing.unitPrice = Number(product.price);
        existing.totalPrice = Number(existing.quantity) * Number(existing.unitPrice);
        results.push(await this.cartRepo.save(existing));
        continue;
      }

      // 3) create new item
      const newItem = this.cartRepo.create({
        cart,
        product,
        quantity: Number(dto.quantity),
        unitPrice: Number(product.price),
        totalPrice: Number(dto.quantity) * Number(product.price),
      });
      results.push(await this.cartRepo.save(newItem));
    }

    // 4) fetch items (to return) + SQL SUM for cart total
    const itemsInCart = await this.cartRepo.find({
      where: { cart: {cartId: cart.cartId} },
      relations: ['product'],
      order: { id: 'ASC' },
    });

    const totalPrice = await this.getCartSumById(cart.cartId);

     const items: CartLineDto[] = itemsInCart.map(i => ({
    id: i.id,
    productId: i.product.id,
    name: i.product.name,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    lineTotal: Number(i.totalPrice),
  }));

  return { cartId: cart.cartId, totalPrice, items };
}
  

  async findcart(userId: number): Promise<CartResponseDto> {
    const cart = await this.cartEntityRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!cart) {
      return { cartId: 0, totalPrice: 0, items: [] };
    }

    const rows = await this.cartRepo.find({
    where: { cart: { cartId: cart.cartId } },
    relations: ['product'],
    order: { id: 'ASC' },
  });
  
    const items: CartLineDto[] = rows.map(i => ({
    id: i.id,
    productId: i.product.id,
    name: i.product.name,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    lineTotal: Number(i.totalPrice),
  }));

    const totalPrice = await this.getCartSumById(cart.cartId);
    return { cartId: cart.cartId, totalPrice, items };
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
