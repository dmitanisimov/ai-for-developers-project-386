import { Type } from "class-transformer";
import { IsIn, IsOptional, Matches } from "class-validator";

export class ListSlotsQuery {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([15, 30])
  durationMinutes?: number;

  @IsOptional()
  @IsIn(["true", "false"])
  includeStatus?: string;
}
