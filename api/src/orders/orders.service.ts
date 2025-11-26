import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService, FilamentWithUsage } from '../pricing/pricing.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    // 1. Fetch related entities
    const product = await this.prisma.product.findUnique({
      where: { id: createOrderDto.product_id },
      include: { addons: true }
    });
    if (!product) throw new NotFoundException('Product not found');

    const printer = await this.prisma.printer.findUnique({
      where: { id: createOrderDto.printer_id }
    });
    if (!printer) throw new NotFoundException('Printer not found');

    const settings = await this.prisma.settings.findFirst({
      where: { tenant_id: createOrderDto.tenant_id }
    });
    if (!settings) throw new NotFoundException('Settings not found');

    // 2. Prepare Filaments
    const filamentsUsage: FilamentWithUsage[] = [];
    const filamentIds = [
      { id: createOrderDto.filament_1_id, grams: createOrderDto.filament_1_grams_used },
      { id: createOrderDto.filament_2_id, grams: createOrderDto.filament_2_grams_used },
      { id: createOrderDto.filament_3_id, grams: createOrderDto.filament_3_grams_used },
      { id: createOrderDto.filament_4_id, grams: createOrderDto.filament_4_grams_used },
    ];

    for (const item of filamentIds) {
      if (item.id && item.grams > 0) {
        const fil = await this.prisma.filament.findUnique({ where: { id: item.id } });
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
      createOrderDto.print_time_minutes
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
      }
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        client: true,
        product: true,
      }
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        product: true,
      }
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order (Not implemented yet)`;
  }

  remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }
}
