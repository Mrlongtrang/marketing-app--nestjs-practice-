import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}
  create(dto: CreateProductDto) {
    return { message: 'Product created successfully', data: dto };
  }

  findAll(options?: FindManyOptions<Product>): Promise<Product[]> {
    return this.productRepo.find(options);
  }

  findOne(id: number): Promise<Product | null> {
    return this.productRepo.findOneBy({ id });
  }

  update(id: string, dto: UpdateProductDto) {
    return { message: `Product ${id} updated successfully`, data: dto };
  }

  async remove(id: number) {
    const result = await this.productRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return { message: 'Product soft-deleted', id };
  }
}
