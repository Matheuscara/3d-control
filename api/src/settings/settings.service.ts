import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) { }

  create(createSettingDto: CreateSettingDto) {
    return this.prisma.settings.create({
      data: createSettingDto as any,
    });
  }

  findAll() {
    return this.prisma.settings.findMany();
  }

  findOne(id: string) {
    return this.prisma.settings.findUnique({ where: { id } });
  }

  update(id: string, updateSettingDto: UpdateSettingDto) {
    return this.prisma.settings.update({
      where: { id },
      data: updateSettingDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.settings.delete({ where: { id } });
  }
}
