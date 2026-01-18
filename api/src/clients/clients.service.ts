import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GetTopRevenueStatsDto } from './dto/get-top-revenue-stats.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getTopRevenueStats(tenant_id: string, query: GetTopRevenueStatsDto) {
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
        client: true,
      },
    });

    const byClient = orders.reduce((acc, order) => {
      if (!acc[order.client_id]) {
        acc[order.client_id] = {
          client_id: order.client_id,
          name: order.client.name,
          segment: order.client.segment,
          total_revenue: new Decimal(0),
          total_profit: new Decimal(0),
          orders_count: 0,
          first_order_date: order.created_at,
          last_order_date: order.created_at,
        };
      }
      acc[order.client_id].orders_count += 1;
      acc[order.client_id].total_revenue = acc[
        order.client_id
      ].total_revenue.plus(order.selling_price);
      acc[order.client_id].total_profit = acc[
        order.client_id
      ].total_profit.plus(order.net_profit);
      if (order.created_at < acc[order.client_id].first_order_date) {
        acc[order.client_id].first_order_date = order.created_at;
      }
      if (order.created_at > acc[order.client_id].last_order_date) {
        acc[order.client_id].last_order_date = order.created_at;
      }
      return acc;
    }, {} as Record<string, { client_id: string; name: string; segment: string; total_revenue: Decimal; total_profit: Decimal; orders_count: number; first_order_date: Date; last_order_date: Date }>);

    const topClients = Object.values(byClient)
      .sort((a, b) => b.total_revenue.comparedTo(a.total_revenue))
      .slice(0, limit)
      .map((c) => {
        const average_ticket =
          c.orders_count === 0
            ? new Decimal(0)
            : c.total_revenue.div(c.orders_count);
        return {
          ...c,
          average_ticket,
        };
      });

    return {
      topClients,
    };
  }

  create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto as any, // TODO: Type properly with DTO
    });
  }

  findAll() {
    return this.prisma.client.findMany();
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  update(id: string, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }
}
