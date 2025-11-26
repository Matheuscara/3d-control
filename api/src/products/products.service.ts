import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  create(createProductDto: CreateProductDto) {
    // Assuming DTO matches Prisma input structure or needs mapping
    // For simplicity, casting to any, but in real app should map relations
    return this.prisma.product.create({
      data: createProductDto as any,
      include: {
        materials: true,
        addons: true,
      }
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        materials: true,
        addons: true,
      }
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        materials: true,
        addons: true,
      }
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto as any,
      include: {
        materials: true,
        addons: true,
      }
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
