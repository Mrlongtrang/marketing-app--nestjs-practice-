// product.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

   private calcFinalPrice(price: number, discount: number): number {
    return price - (price * discount / 100);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    product.finalPrice = this.calcFinalPrice(dto.price, dto.discountPercent || 0);
    return await this.productRepo.save(product);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException();
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    product.finalPrice = this.calcFinalPrice(product.price, product.discountPercent || 0);
    return await this.productRepo.save(product);
  }

  async remove(id: number): Promise<void> {
   const product = await this.findOne(id); // reuse validation
   await this.productRepo.remove(product);
}


  async findAll(query: QueryProductDto): Promise<Product[]> {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      page = '1',
      limit = '10',
    } = query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const qb = this.productRepo.createQueryBuilder('product');

    if (search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (minPrice) {
      qb.andWhere('product.finalPrice >= :minPrice', { minPrice: Number(minPrice) });
    }

    if (maxPrice) {
      qb.andWhere('product.finalPrice <= :maxPrice', { maxPrice: Number(maxPrice) });
    }

    return qb.orderBy('product.createdAt', 'DESC').skip(skip).take(take).getMany();
  }
}
