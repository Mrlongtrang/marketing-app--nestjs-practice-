import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { CartItem } from './entities/cart.entities';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  @ApiOperation({ summary: 'Add a product to cart' })
  @ApiResponse({
    status: 201,
    description: 'Cart item created.',
    type: CartItem,
  })
  create(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartService.create(createCartItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'View all cart items for current user' })
  @ApiResponse({
    status: 200,
    description: 'Cart items fetched.',
    type: [CartItem],
  })
  findAll() {
    return this.cartService.findAll();
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update quantity of a cart item' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated.',
    type: CartItem,
  })
  update(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.update(+id, updateCartItemDto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from cart' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Cart item removed.' })
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
