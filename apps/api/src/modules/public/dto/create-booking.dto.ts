import { IsEmail, IsISO8601, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateBookingDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/)
  eventTypeId!: string;

  @IsISO8601()
  startAt!: string;

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
