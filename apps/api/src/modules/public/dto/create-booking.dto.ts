import { Type } from "class-transformer";
import { IsEmail, IsIn, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBookingDto {
  @IsISO8601()
  startAt!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([15, 30])
  durationMinutes?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  guestName!: string;

  @IsEmail()
  @MaxLength(254)
  guestEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  guestNotes?: string;
}
