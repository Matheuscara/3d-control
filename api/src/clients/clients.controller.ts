import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetTopRevenueStatsDto } from './dto/get-top-revenue-stats.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('stats/top-revenue')
  getTopRevenueStats(@Query() query: GetTopRevenueStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'cln1s8t4s00003b6w5r8g2y5c';
    return this.clientsService.getTopRevenueStats(tenant_id, query);
  }

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
