import { Controller, Get, Post, Body } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

   @UseGuards(JwtAuthGuard)
  @Get()
   @ApiResponse({ status: 200, description: 'Fetch all leads' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.leadService.findAll();
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Creates a new lead' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadService.create(createLeadDto);
  }
}