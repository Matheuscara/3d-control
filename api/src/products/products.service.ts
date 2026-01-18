import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetBestSellersStatsDto } from './dto/get-best-sellers-stats.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getBestSellersStats(tenant_id: string, query: GetBestSellersStatsDto) {
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
      include: {
        product: true,
      },
    });

    const byProduct = orders.reduce((acc, order) => {
      if (!acc[order.product_id]) {
        acc[order.product_id] = {
          product_id: order.product_id,
          name: order.product.name,
          category: order.product.category,
          orders_count: 0,
          total_revenue: new Decimal(0),
          total_profit: new Decimal(0),
        };
      }
      acc[order.product_id].orders_count += 1;
      acc[order.product_id].total_revenue = acc[
        order.product_id
      ].total_revenue.plus(order.selling_price);
      acc[order.product_id].total_profit = acc[
        order.product_id
      ].total_profit.plus(order.net_profit);
      return acc;
    }, {} as Record<string, { product_id: string; name: string; category: string; orders_count: number; total_revenue: Decimal; total_profit: Decimal }>);

    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.orders_count - a.orders_count)
      .slice(0, limit)
      .map((p) => {
        const average_price =
          p.orders_count === 0
            ? new Decimal(0)
            : p.total_revenue.div(p.orders_count);
        const profit_margin = p.total_revenue.isZero()
          ? new Decimal(0)
          : p.total_profit.div(p.total_revenue).mul(100);
        return {
          ...p,
          average_price,
          profit_margin,
        };
      });

    return {
      topProducts,
    };
  }

  create(createProductDto: CreateProductDto) {
    const { materials, addons, ...productData } = createProductDto as any;

    return this.prisma.product.create({
      data: {
        ...productData,
        materials: materials?.length ? { create: materials } : undefined,
        addons: addons?.length ? { create: addons } : undefined,
      },
      include: {
        materials: true,
        addons: true,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        materials: true,
        addons: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        materials: true,
        addons: true,
      },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto as any,
      include: {
        materials: true,
        addons: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
