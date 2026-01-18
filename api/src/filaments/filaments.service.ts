import { Injectable } from '@nestjs/common';
import { CreateFilamentDto } from './dto/create-filament.dto';
import { UpdateFilamentDto } from './dto/update-filament.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetLowStockStatsDto } from './dto/get-low-stock-stats.dto';
import { Decimal } from '@prisma/client/runtime/library';

import { GetMostUsedStatsDto } from './dto/get-most-used-stats.dto';

@Injectable()
export class FilamentsService {
  constructor(private prisma: PrismaService) {}

  async getLowStockStats(tenant_id: string, query: GetLowStockStatsDto) {
    const { threshold } = query;

    const filaments = await this.prisma.filament.findMany({
      where: {
        tenant_id,
        is_active: true,
      },
    });

    const lowStock = filaments
      .map((f) => {
        const remaining_grams = new Decimal(f.stock_quantity).mul(
          f.weight_grams,
        );
        const cost_per_gram = new Decimal(f.purchase_price)
          .plus(f.shipping_cost)
          .div(f.weight_grams);
        return {
          ...f,
          remaining_grams,
          cost_per_gram,
        };
      })
      .filter((f) => f.remaining_grams.lt(threshold));

    const criticalCount = lowStock.filter((f) =>
      f.remaining_grams.lt(200),
    ).length;
    const warningCount = lowStock.filter(
      (f) => f.remaining_grams.gte(200) && f.remaining_grams.lt(threshold),
    ).length;

    return {
      lowStockItems: lowStock.map((f) => ({
        id: f.id,
        brand: f.brand,
        material_type: f.material_type,
        color: f.color,
        remaining_grams: f.remaining_grams,
        stock_quantity: f.stock_quantity,
        cost_per_gram: f.cost_per_gram,
        estimated_days_left: 0, // Not implemented yet
      })),
      criticalCount,
      warningCount,
    };
  }

  async getInventoryValueStats(tenant_id: string) {
    const filaments = await this.prisma.filament.findMany({
      where: {
        tenant_id,
        is_active: true,
      },
    });

    const totalValue = filaments.reduce(
      (sum, f) => sum.plus(new Decimal(f.purchase_price).mul(f.stock_quantity)),
      new Decimal(0),
    );
    const totalWeight = filaments.reduce(
      (sum, f) => sum + f.weight_grams * f.stock_quantity,
      0,
    );
    const totalSpools = filaments.reduce((sum, f) => sum + f.stock_quantity, 0);

    const byMaterial = filaments.reduce((acc, f) => {
      if (!acc[f.material_type]) {
        acc[f.material_type] = {
          material_type: f.material_type,
          totalValue: new Decimal(0),
          totalWeight: 0,
          totalSpools: 0,
        };
      }
      acc[f.material_type].totalValue = acc[f.material_type].totalValue.plus(
        new Decimal(f.purchase_price).mul(f.stock_quantity),
      );
      acc[f.material_type].totalWeight += f.weight_grams * f.stock_quantity;
      acc[f.material_type].totalSpools += f.stock_quantity;
      return acc;
    }, {} as Record<string, { material_type: string; totalValue: Decimal; totalWeight: number; totalSpools: number }>);

    const averageCostPerGram =
      totalWeight === 0 ? new Decimal(0) : totalValue.div(totalWeight);

    return {
      totalValue,
      totalWeight,
      totalSpools,
      averageCostPerGram,
      byMaterial: Object.values(byMaterial),
    };
  }

  async getMostUsedStats(tenant_id: string, query: GetMostUsedStatsDto) {
    const { limit, period, month, year } = query;
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

    const filamentUsage = orders.reduce((acc, order) => {
      for (let i = 1; i <= 4; i++) {
        const filamentId = order[`filament_${i}_id`];
        const gramsUsed = order[`filament_${i}_grams_used`];
        if (filamentId && gramsUsed) {
          if (!acc[filamentId]) {
            acc[filamentId] = {
              total_grams_used: new Decimal(0),
              orders_count: 0,
            };
          }
          acc[filamentId].total_grams_used =
            acc[filamentId].total_grams_used.plus(gramsUsed);
          acc[filamentId].orders_count += 1;
        }
      }
      return acc;
    }, {} as Record<string, { total_grams_used: Decimal; orders_count: number }>);

    const filamentIds = Object.keys(filamentUsage);
    const filaments = await this.prisma.filament.findMany({
      where: {
        id: {
          in: filamentIds,
        },
      },
    });

    const topMaterials = filaments
      .map((filament) => {
        const usage = filamentUsage[filament.id];
        const cost_per_gram = new Decimal(filament.purchase_price)
          .plus(filament.shipping_cost)
          .div(filament.weight_grams);
        const total_cost = usage.total_grams_used.mul(cost_per_gram);
        const average_grams_per_order =
          usage.orders_count === 0
            ? new Decimal(0)
            : usage.total_grams_used.div(usage.orders_count);

        return {
          filament_id: filament.id,
          brand: filament.brand,
          material_type: filament.material_type,
          color: filament.color,
          total_grams_used: usage.total_grams_used,
          orders_count: usage.orders_count,
          total_cost,
          average_grams_per_order,
        };
      })
      .sort((a, b) => b.total_grams_used.comparedTo(a.total_grams_used))
      .slice(0, limit);

    return {
      topMaterials,
    };
  }

  create(createFilamentDto: CreateFilamentDto) {
    return this.prisma.filament.create({
      data: createFilamentDto as any,
    });
  }

  findAll() {
    return this.prisma.filament.findMany();
  }

  findOne(id: string) {
    return this.prisma.filament.findUnique({ where: { id } });
  }

  update(id: string, updateFilamentDto: UpdateFilamentDto) {
    return this.prisma.filament.update({
      where: { id },
      data: updateFilamentDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.filament.delete({ where: { id } });
  }
}
