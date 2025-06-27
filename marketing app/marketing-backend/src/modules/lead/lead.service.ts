import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from './lead.entity';

@Injectable()
export class LeadService {
  private leads: Lead[] = [];


  findAll(): Lead[] {
    return this.leads;
  }

   create(dto: CreateLeadDto): Lead {
    const lead: Lead = {
      id: Date.now(),
      name: dto.name,
      email: dto.email,
    };
    this.leads.push(lead);
    return lead;
  }
}