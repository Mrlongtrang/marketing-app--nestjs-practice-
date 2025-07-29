import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/types/express';
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  async checkout(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.orderService.checkout(userId);
  }

  @Get()
  async getMyOrders(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.orderService.getOrdersForUser(userId);
  }
}
