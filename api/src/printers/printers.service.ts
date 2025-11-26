import { Injectable } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrintersService {
  constructor(private prisma: PrismaService) { }

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
