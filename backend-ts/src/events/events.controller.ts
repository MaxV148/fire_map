import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserId } from '../decorators/user-id.decorator';
import { EventOwnerOrAdminGuard } from '../auth/owner-or-admin.guard';
import { EventFilterDto } from './dto/event-filter.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @UserId() userId: string) {
    return this.eventsService.create(createEventDto, +userId);
  }

  @Get()
  findAll(@Query() filter: EventFilterDto) {
    return this.eventsService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(EventOwnerOrAdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(EventOwnerOrAdminGuard)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
