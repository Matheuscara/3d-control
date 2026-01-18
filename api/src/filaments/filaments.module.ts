import { Module } from '@nestjs/common';
import { FilamentsService } from './filaments.service';
import { FilamentsController } from './filaments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FilamentsController],
  providers: [FilamentsService],
})
export class FilamentsModule {}
