import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { CartItem } from './entities/cart.entities';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/common/decorators/user.decorator';
import { getPagination } from 'src/common/utils';
import { PaginationQueryDto } from 'src/common/dto/base.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  productService: any;
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Add a product to cart' })
  @ApiResponse({
    status: 201,
    description: 'Cart item created.',
    type: CartItem,
  })
  create(
    @User() user: { id: number },
    @Body() CreateCartItemDto: CreateCartItemDto,
  ) {
    return this.cartService.create(CreateCartItemDto, Number(user.id));
  }

  @Get()
  @ApiOperation({ summary: 'View all cart items for current user' })
  @ApiResponse({
    status: 200,
    description: 'Cart items fetched.',
    type: [CartItem],
  })
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    const { limit, skip } = getPagination(query);
    return this.cartService.findAll({ skip, take: limit });
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
