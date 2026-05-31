import { Type } from "class-transformer";
import { IsIn, IsOptional, Matches } from "class-validator";

export class ListSlotsQuery {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  from?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsOptional()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([15, 30])
  durationMinutes?: number;

  @IsOptional()
  @IsIn(["true", "false"])
  includeStatus?: string;
}
