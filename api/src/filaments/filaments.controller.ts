import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FilamentsService } from './filaments.service';
import { CreateFilamentDto } from './dto/create-filament.dto';
import { UpdateFilamentDto } from './dto/update-filament.dto';

@Controller('filaments')
export class FilamentsController {
  constructor(private readonly filamentsService: FilamentsService) { }

  @Post()
  create(@Body() createFilamentDto: CreateFilamentDto) {
    return this.filamentsService.create(createFilamentDto);
  }

  @Get()
  findAll() {
    return this.filamentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filamentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilamentDto: UpdateFilamentDto) {
    return this.filamentsService.update(id, updateFilamentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filamentsService.remove(id);
  }
}
