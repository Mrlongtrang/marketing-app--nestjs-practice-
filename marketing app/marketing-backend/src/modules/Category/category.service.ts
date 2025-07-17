import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  create(body: CreateCategoryDto) {
    return {
      message: 'Category created successfully',
      data: body,
    };
  }

  findAll() {
    return {
      message: 'Fetched all categories',
      data: [],
    };
  }

  findOne(id: string) {
    return {
      message: `Fetched category ${id}`,
      data: {},
    };
  }

  update(id: string, body: UpdateCategoryDto) {
    return {
      message: `Category ${id} updated successfully`,
      data: body,
    };
  }

  remove(id: string) {
    return {
      message: `Category ${id} deleted successfully`,
    };
  }
}
