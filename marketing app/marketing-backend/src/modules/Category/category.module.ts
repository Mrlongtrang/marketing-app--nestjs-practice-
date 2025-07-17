import { Module } from '@nestjs/common';
import { CategoryController } from './catgory.controller';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
