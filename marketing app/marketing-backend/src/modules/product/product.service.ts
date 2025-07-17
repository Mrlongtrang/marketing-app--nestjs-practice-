import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  create(dto: CreateProductDto) {
    return { message: 'Product created successfully', data: dto };
  }

  findAll() {
    return { message: 'Fetched product list', data: [] };
  }

  findOne(id: string) {
    return { message: `Fetched product with id ${id}`, data: { id } };
  }

  update(id: string, dto: UpdateProductDto) {
    return { message: `Product ${id} updated successfully`, data: dto };
  }

  remove(id: string): { message: string } {
    return { message: `Product ${id} deleted successfully` };
  }
}
