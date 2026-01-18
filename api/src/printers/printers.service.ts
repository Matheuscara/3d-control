import { Injectable } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetUsageStatsDto } from './dto/get-usage-stats.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PrintersService {
  constructor(private prisma: PrismaService) {}

  async getUsageStats(tenant_id: string, query: GetUsageStatsDto) {
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

    const printers = await this.prisma.printer.findMany({
      where: { tenant_id },
    });

    const orders = await this.prisma.order.findMany({
      where: {
        tenant_id,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        printer_id: true,
        print_time_minutes: true,
        final_energy_cost: true,
        final_depreciation_cost: true,
      },
    });

    const printerUsage = printers.map((printer) => {
      const printerOrders = orders.filter(
        (order) => order.printer_id === printer.id,
      );
      const total_hours = printerOrders.reduce(
        (sum, order) => sum + order.print_time_minutes / 60,
        0,
      );
      const energy_cost = printerOrders.reduce(
        (sum, order) => sum.plus(order.final_energy_cost),
        new Decimal(0),
      );
      const depreciation_cost = printerOrders.reduce(
        (sum, order) => sum.plus(order.final_depreciation_cost),
        new Decimal(0),
      );
      const operating_cost = energy_cost.plus(depreciation_cost);
      const orders_count = printerOrders.length;
      const utilization_percent = (total_hours / printer.lifespan_hours) * 100;

      return {
        printer_id: printer.id,
        name: printer.name,
        total_hours,
        operating_cost,
        energy_cost,
        depreciation_cost,
        orders_count,
        utilization_percent,
      };
    });

    const totalPrinters = printers.length;
    const totalOperatingCost = printerUsage.reduce(
      (sum, p) => sum.plus(p.operating_cost),
      new Decimal(0),
    );
    const totalPrintHours = printerUsage.reduce(
      (sum, p) => sum + p.total_hours,
      0,
    );

    return {
      totalPrinters,
      totalOperatingCost,
      totalPrintHours,
      printerUsage,
    };
  }

  create(createPrinterDto: CreatePrinterDto) {
    return this.prisma.printer.create({
      data: createPrinterDto as any,
    });
  }

  findAll() {
    return this.prisma.printer.findMany();
  }

  findOne(id: string) {
    return this.prisma.printer.findUnique({ where: { id } });
  }

  update(id: string, updatePrinterDto: UpdatePrinterDto) {
    return this.prisma.printer.update({
      where: { id },
      data: updatePrinterDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.printer.delete({ where: { id } });
  }
}
