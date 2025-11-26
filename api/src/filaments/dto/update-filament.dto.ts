import { PartialType } from '@nestjs/mapped-types';
import { CreateFilamentDto } from './create-filament.dto';

export class UpdateFilamentDto extends PartialType(CreateFilamentDto) {}
