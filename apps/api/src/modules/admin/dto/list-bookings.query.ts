import { IsIn, IsOptional } from "class-validator";

export class ListBookingsQuery {
  @IsOptional()
  @IsIn(["upcoming", "past", "cancelled", "all"])
  status: "all" | "cancelled" | "past" | "upcoming" = "upcoming";
}
