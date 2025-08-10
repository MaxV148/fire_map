import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AdminGuard } from '../auth/admin.guard';
import { UserId } from '../decorators/user-id.decorator';
import { AuthGuard } from '../auth/auth.guard';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createTagDto: CreateTagDto, @UserId() userId: string) {
    return this.tagsService.create(createTagDto, parseInt(userId));
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.tagsService.findAll();
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(+id, updateTagDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
