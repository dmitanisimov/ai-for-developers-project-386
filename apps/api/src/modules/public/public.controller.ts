import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { ListSlotsQuery } from "./dto/list-slots.query";
import { PublicService } from "./public.service";

@Controller("api/public")
export class PublicController {
  constructor(@Inject(PublicService) private readonly publicService: PublicService) {}

  @Get("profile")
  getProfile() {
    return this.publicService.getProfile();
  }

  @Get("owner")
  getOwner() {
    return this.publicService.getOwner();
  }

  @Get("event-types")
  getEventTypes() {
    return this.publicService.getEventTypes();
  }

  @Get("event-types/:eventTypeId/slots")
  getEventTypeSlots(@Param("eventTypeId") eventTypeId: string, @Query("includeStatus") includeStatus?: string) {
    return this.publicService.getEventTypeSlots(eventTypeId, includeStatus);
  }

  @Get("slots")
  getSlots(@Query() query: ListSlotsQuery) {
    return this.publicService.getSlots(query);
  }

  @Post("bookings")
  @HttpCode(201)
  createBooking(@Body() dto: CreateBookingDto) {
    return this.publicService.createBooking(dto);
  }

  @Get("bookings/:id")
  getBooking(@Param("id") id: string) {
    return this.publicService.getBooking(id);
  }
}
