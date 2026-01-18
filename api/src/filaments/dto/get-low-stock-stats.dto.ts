import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLowStockStatsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  threshold?: number = 500;
}
