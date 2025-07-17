/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[ADMIN] Search users' })
  @ApiResponse({ status: 200, description: 'Get user by ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[ADMIN] Upate user info' })
  @ApiResponse({ status: 200, description: 'Update user info' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: Request & { user: import('../user/user.entity').User },
  ) {
    return this.userService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[ADMIN] Delete user' })
  @ApiResponse({ status: 204, description: 'Delete user' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
