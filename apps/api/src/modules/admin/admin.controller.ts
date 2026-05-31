import { Body, Controller, Get, Inject, Param, Patch, Put, Query, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../auth/session.guard";
import { AdminService } from "./admin.service";
import { ListBookingsQuery } from "./dto/list-bookings.query";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("api/admin")
@UseGuards(SessionGuard)
export class AdminController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get("bookings")
  getBookings(@Query() query: ListBookingsQuery) {
    return this.admin.getBookings(query.status);
  }

  @Patch("bookings/:id/cancel")
  cancelBooking(@Param("id") id: string) {
    return this.admin.cancelBooking(id);
  }

  @Get("availability")
  getAvailability() {
    return this.admin.getAvailability();
  }

  @Put("availability")
  updateAvailability(@Body() dto: UpdateAvailabilityDto) {
    return this.admin.updateAvailability(dto);
  }

  @Get("profile")
  getProfile() {
    return this.admin.getProfile();
  }

  @Put("profile")
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.admin.updateProfile(dto);
  }
}
