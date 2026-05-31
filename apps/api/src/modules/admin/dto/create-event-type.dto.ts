import { Type } from "class-transformer";
import { IsInt, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateEventTypeDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/)
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(240)
  durationMinutes!: number;
}
