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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetFinancialStatsDto } from './dto/get-financial-stats.dto';
import { GetStatusStatsDto } from './dto/get-status-stats.dto';
import { GetByPlatformStatsDto } from './dto/get-by-platform-stats.dto';
import { GetDailyRevenueStatsDto } from './dto/get-daily-revenue-stats.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats/financial')
  getFinancialStats(@Query() query: GetFinancialStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'user-admin-id-123';
    return this.ordersService.getFinancialStats(tenant_id, query);
  }

  @Get('stats/status')
  getStatusStats(@Query() query: GetStatusStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'user-admin-id-123';
    return this.ordersService.getStatusStats(tenant_id, query);
  }

  @Get('stats/by-platform')
  getByPlatformStats(@Query() query: GetByPlatformStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'user-admin-id-123';
    return this.ordersService.getByPlatformStats(tenant_id, query);
  }

  @Get('stats/daily-revenue')
  getDailyRevenueStats(@Query() query: GetDailyRevenueStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'user-admin-id-123';
    return this.ordersService.getDailyRevenueStats(tenant_id, query);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
