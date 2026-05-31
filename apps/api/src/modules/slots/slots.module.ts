import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { SlotsService } from "./slots.service";

@Module({
  imports: [DatabaseModule],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
