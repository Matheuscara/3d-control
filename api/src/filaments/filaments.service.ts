import { Injectable } from '@nestjs/common';
import { CreateFilamentDto } from './dto/create-filament.dto';
import { UpdateFilamentDto } from './dto/update-filament.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilamentsService {
  constructor(private prisma: PrismaService) { }

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
