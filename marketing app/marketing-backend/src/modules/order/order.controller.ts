import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/types/express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  async checkout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CheckoutDto,) {
    const userId = req.user.id;
    return this.orderService.checkout(userId, dto);
  }

  @Get()
  async getMyOrders(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.orderService.getOrdersForUser(userId);
  }
}
