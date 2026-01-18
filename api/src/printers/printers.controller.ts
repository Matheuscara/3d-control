import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PrintersService } from './printers.service';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { GetUsageStatsDto } from './dto/get-usage-stats.dto';

@Controller('printers')
export class PrintersController {
  constructor(private readonly printersService: PrintersService) {}

  @Get('stats/usage')
  getUsageStats(@Query() query: GetUsageStatsDto) {
    // tenant_id will be added later via AuthGuard or decorator
    const tenant_id = 'user-admin-id-123';
    return this.printersService.getUsageStats(tenant_id, query);
  }

  @Post()
  create(@Body() createPrinterDto: CreatePrinterDto) {
    return this.printersService.create(createPrinterDto);
  }

  @Get()
  findAll() {
    return this.printersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.printersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrinterDto: UpdatePrinterDto) {
    return this.printersService.update(id, updatePrinterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.printersService.remove(id);
  }
}
