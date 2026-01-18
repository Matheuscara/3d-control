import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetFinancialStatsDto {
  @IsString()
  @IsIn(['month', 'year', 'all'])
  period: 'month' | 'year' | 'all' = 'month';

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
