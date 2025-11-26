import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

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
