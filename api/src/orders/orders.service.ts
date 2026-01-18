import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService, FilamentWithUsage } from '../pricing/pricing.service';
import { GetFinancialStatsDto } from './dto/get-financial-stats.dto';
import { GetStatusStatsDto } from './dto/get-status-stats.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { GetByPlatformStatsDto } from './dto/get-by-platform-stats.dto';
import { GetDailyRevenueStatsDto } from './dto/get-daily-revenue-stats.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) {}

  async getFinancialStats(tenant_id: string, query: GetFinancialStatsDto) {
    const { period, month, year } = query;
    let startDate: Date;
    let endDate: Date = new Date();

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month ? month - 1 : new Date().getMonth();

    switch (period) {
      case 'month':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        break;
      case 'all':
        startDate = new Date(0); // The beginning of time
        break;
    }

    const orders = await this.prisma.order.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum.plus(o.selling_price),
      new Decimal(0),
    );
    const totalProfit = orders.reduce(
      (sum, o) => sum.plus(o.net_profit),
      new Decimal(0),
    );
    const totalOrders = orders.length;

    const totalCosts = {
      material: orders.reduce(
        (sum, o) => sum.plus(o.final_material_cost),
        new Decimal(0),
      ),
      energy: orders.reduce(
        (sum, o) => sum.plus(o.final_energy_cost),
        new Decimal(0),
      ),
      depreciation: orders.reduce(
        (sum, o) => sum.plus(o.final_depreciation_cost),
        new Decimal(0),
      ),
      labor: orders.reduce(
        (sum, o) => sum.plus(o.final_labor_cost),
        new Decimal(0),
      ),
      platformFees: orders.reduce(
        (sum, o) => sum.plus(o.final_platform_fee),
        new Decimal(0),
      ),
    };

    const profitMargin = totalRevenue.isZero()
      ? new Decimal(0)
      : totalProfit.div(totalRevenue).mul(100);
    const averageTicket =
      totalOrders === 0 ? new Decimal(0) : totalRevenue.div(totalOrders);

    return {
      totalRevenue,
      totalProfit,
      profitMargin,
      averageTicket,
      totalOrders,
      totalCosts,
    };
  }

  async getStatusStats(tenant_id: string, query: GetStatusStatsDto) {
    const { period, month, year } = query;
    let startDate: Date;
    let endDate: Date = new Date();

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month ? month - 1 : new Date().getMonth();

    switch (period) {
      case 'month':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        break;
    }

    const orders = await this.prisma.order.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = orders.length;
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalScrapRate = orders.reduce(
      (sum, o) => sum.plus(o.scrap_rate_percent),
      new Decimal(0),
    );
    const averageScrapRate =
      total === 0 ? new Decimal(0) : totalScrapRate.div(total);

    const totalPrintTime = orders.reduce(
      (sum, o) => sum + o.print_time_minutes,
      0,
    );
    const averagePrintTime = total === 0 ? 0 : totalPrintTime / total;

    const successRate = new Decimal(100).minus(averageScrapRate);

    return {
      total,
      byStatus: {
        COMPLETED: byStatus['COMPLETED'] || 0,
        PENDING: byStatus['PENDING'] || 0,
        CANCELLED: byStatus['CANCELLED'] || 0,
        IN_PRODUCTION: byStatus['IN_PRODUCTION'] || 0,
      },
      successRate,
      averageScrapRate,
      averagePrintTime,
    };
  }

  async getByPlatformStats(tenant_id: string, query: GetByPlatformStatsDto) {
    const { period, month, year } = query;
    let startDate: Date;
    let endDate: Date = new Date();

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month ? month - 1 : new Date().getMonth();

    switch (period) {
      case 'month':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        break;
    }

    const orders = await this.prisma.order.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum.plus(o.selling_price),
      new Decimal(0),
    );

    const byPlatform = orders.reduce((acc, order) => {
      if (!acc[order.platform_name]) {
        acc[order.platform_name] = {
          platform_name: order.platform_name,
          total_revenue: new Decimal(0),
          total_profit: new Decimal(0),
          orders_count: 0,
          total_fee_percent: new Decimal(0),
        };
      }
      acc[order.platform_name].total_revenue = acc[
        order.platform_name
      ].total_revenue.plus(order.selling_price);
      acc[order.platform_name].total_profit = acc[
        order.platform_name
      ].total_profit.plus(order.net_profit);
      acc[order.platform_name].orders_count += 1;
      acc[order.platform_name].total_fee_percent = acc[
        order.platform_name
      ].total_fee_percent.plus(order.platform_fee_percent);
      return acc;
    }, {} as Record<string, { platform_name: string; total_revenue: Decimal; total_profit: Decimal; orders_count: number; total_fee_percent: Decimal }>);

    const platforms = Object.values(byPlatform).map((p) => {
      const percentage = totalRevenue.isZero()
        ? new Decimal(0)
        : p.total_revenue.div(totalRevenue).mul(100);
      const average_fee_percent =
        p.orders_count === 0
          ? new Decimal(0)
          : p.total_fee_percent.div(p.orders_count);
      return {
        ...p,
        percentage,
        average_fee_percent,
      };
    });

    return {
      platforms,
      totalRevenue,
    };
  }

  async getDailyRevenueStats(
    tenant_id: string,
    query: GetDailyRevenueStatsDto,
  ) {
    const { days } = query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: startDate,
        },
      },
    });

    const byDate = orders.reduce((acc, order) => {
      const date = order.created_at.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: new Decimal(0),
          profit: new Decimal(0),
          orders_count: 0,
        };
      }
      acc[date].revenue = acc[date].revenue.plus(order.selling_price);
      acc[date].profit = acc[date].profit.plus(order.net_profit);
      acc[date].orders_count += 1;
      return acc;
    }, {} as Record<string, { date: string; revenue: Decimal; profit: Decimal; orders_count: number }>);

    const dailyData = Object.values(byDate).map((d) => {
      const profit_margin = d.revenue.isZero()
        ? new Decimal(0)
        : d.profit.div(d.revenue).mul(100);
      return {
        ...d,
        profit_margin,
      };
    });

    return {
      dailyData,
    };
  }

  async create(createOrderDto: CreateOrderDto) {
    // 1. Fetch related entities
    const product = await this.prisma.product.findUnique({
      where: { id: createOrderDto.product_id },
      include: { addons: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const printer = await this.prisma.printer.findUnique({
      where: { id: createOrderDto.printer_id },
    });
    if (!printer) throw new NotFoundException('Printer not found');

    const settings = await this.prisma.settings.findFirst({
      where: { tenant_id: createOrderDto.tenant_id },
    });
    if (!settings) throw new NotFoundException('Settings not found');

    // 2. Prepare Filaments
    const filamentsUsage: FilamentWithUsage[] = [];
    const filamentIds = [
      {
        id: createOrderDto.filament_1_id,
        grams: createOrderDto.filament_1_grams_used,
      },
      {
        id: createOrderDto.filament_2_id,
        grams: createOrderDto.filament_2_grams_used,
      },
      {
        id: createOrderDto.filament_3_id,
        grams: createOrderDto.filament_3_grams_used,
      },
      {
        id: createOrderDto.filament_4_id,
        grams: createOrderDto.filament_4_grams_used,
      },
    ];

    for (const item of filamentIds) {
      if (item.id && item.grams > 0) {
        const fil = await this.prisma.filament.findUnique({
          where: { id: item.id },
        });
        if (fil) {
          filamentsUsage.push({ ...fil, grams_used: item.grams });
        }
      }
    }

    // 3. Calculate Pricing
    const pricing = this.pricingService.calculateOrderPricing(
      product,
      filamentsUsage,
      printer,
      settings,
      createOrderDto.markup_percent / 100, // Convert 50 to 0.5
      createOrderDto.platform_fee_percent,
      createOrderDto.scrap_rate_percent,
      createOrderDto.print_time_minutes,
    );

    // 4. Save Order
    return this.prisma.order.create({
      data: {
        tenant_id: createOrderDto.tenant_id,
        client_id: createOrderDto.client_id,
        product_id: createOrderDto.product_id,
        printer_id: createOrderDto.printer_id,

        platform_name: createOrderDto.platform_name,
        platform_fee_percent: createOrderDto.platform_fee_percent,
        scrap_rate_percent: createOrderDto.scrap_rate_percent,

        print_time_minutes: createOrderDto.print_time_minutes,

        filament_1_id: createOrderDto.filament_1_id,
        filament_1_grams_used: createOrderDto.filament_1_grams_used,
        filament_2_id: createOrderDto.filament_2_id,
        filament_2_grams_used: createOrderDto.filament_2_grams_used,
        filament_3_id: createOrderDto.filament_3_id,
        filament_3_grams_used: createOrderDto.filament_3_grams_used,
        filament_4_id: createOrderDto.filament_4_id,
        filament_4_grams_used: createOrderDto.filament_4_grams_used,

        final_material_cost: pricing.final_material_cost,
        final_energy_cost: pricing.final_energy_cost,
        final_depreciation_cost: pricing.final_depreciation_cost,
        final_labor_cost: pricing.final_labor_cost,
        final_platform_fee: pricing.final_platform_fee,

        selling_price: pricing.preco_venda_sugerido,
        net_profit: pricing.lucro_liquido,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        client: true,
        product: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        product: true,
      },
    });
  }

  update(id: string, _updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order (Not implemented yet)`;
  }

  remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }
}
