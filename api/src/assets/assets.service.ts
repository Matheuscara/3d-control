import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) { }

  create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: createAssetDto as any,
    });
  }

  findAll() {
    return this.prisma.asset.findMany();
  }

  findOne(id: string) {
    return this.prisma.asset.findUnique({ where: { id } });
  }

  update(id: string, updateAssetDto: UpdateAssetDto) {
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.asset.delete({ where: { id } });
  }
}
