import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, Matches, Max, Min, ValidateNested } from "class-validator";

export class AvailabilityRuleDto {
  @IsInt()
  @Min(1)
  @Max(7)
  weekday!: number;

  @IsBoolean()
  enabled!: boolean;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;
}

export class UpdateAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityRuleDto)
  availability!: AvailabilityRuleDto[];
}
