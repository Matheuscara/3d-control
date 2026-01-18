import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBestSellersStatsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsString()
  @IsIn(['month', 'year'])
  period: 'month' | 'year' = 'month';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
