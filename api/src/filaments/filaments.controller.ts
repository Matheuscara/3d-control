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
import { FilamentsService } from './filaments.service';
import { CreateFilamentDto } from './dto/create-filament.dto';
import { UpdateFilamentDto } from './dto/update-filament.dto';
import { GetLowStockStatsDto } from './dto/get-low-stock-stats.dto';
import { GetMostUsedStatsDto } from './dto/get-most-used-stats.dto';

@Controller('filaments')
export class FilamentsController {
  constructor(private readonly filamentsService: FilamentsService) {}

  @Get('stats/low-stock')
  getLowStockStats(@Query() query: GetLowStockStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'cln1s8t4s00003b6w5r8g2y5c';
    return this.filamentsService.getLowStockStats(tenant_id, query);
  }

  @Get('stats/inventory-value')
  getInventoryValueStats() {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'cln1s8t4s00003b6w5r8g2y5c';
    return this.filamentsService.getInventoryValueStats(tenant_id);
  }

  @Get('stats/most-used')
  getMostUsedStats(@Query() query: GetMostUsedStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'cln1s8t4s00003b6w5r8g2y5c';
    return this.filamentsService.getMostUsedStats(tenant_id, query);
  }

  @Post()
  create(@Body() createFilamentDto: CreateFilamentDto) {
    return this.filamentsService.create(createFilamentDto);
  }

  @Get()
  findAll() {
    return this.filamentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filamentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFilamentDto: UpdateFilamentDto,
  ) {
    return this.filamentsService.update(id, updateFilamentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filamentsService.remove(id);
  }
}
