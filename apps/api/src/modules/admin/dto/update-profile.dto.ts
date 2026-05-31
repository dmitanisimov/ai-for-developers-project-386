import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  ownerName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  ownerTitle!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  ownerBio!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl!: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  meetingTitle!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  meetingDescription!: string;

  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(240)
  meetingDurationMinutes!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  timezone!: string;
}
