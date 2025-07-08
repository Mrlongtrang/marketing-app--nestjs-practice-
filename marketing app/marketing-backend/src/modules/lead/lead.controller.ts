import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Injectable, Body, Controller, Get, UseGuards, Post } from '@nestjs/common';
import { Request } from 'express';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { jwtConstants } from '../auth/constant'; // Update path if needed

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token, // Read JWT from cookie
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret, // Use your actual secret
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role, // Optional: depends on your token payload
    };
  }
}

@Controller('leads')
@ApiTags('leads')
@ApiBearerAuth()
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



