import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteListDto, InviteResponseDto } from './dto/invite-response.dto';
import type { Request } from 'express';
import { UserId } from '../decorators/user-id.decorator';
import { AdminGuard } from '../auth/admin.guard';

@Controller('invites')
@UseGuards(AdminGuard)
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  async create(
    @Body() dto: CreateInviteDto,
    @Req() req: Request,
    @UserId() userId: string,
  ): Promise<InviteResponseDto> {
    return this.invitesService.createInvite(dto, req, userId);
  }

  @Get()
  async findAll(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 100,
  ): Promise<InviteListDto> {
    return this.invitesService.listInvites(skip, limit);
  }

  @Get(':inviteUuid')
  async findOne(
    @Param('inviteUuid') inviteUuid: string,
  ): Promise<InviteResponseDto> {
    return this.invitesService.getInviteByUuid(inviteUuid);
  }

  @Delete(':inviteUuid')
  async remove(@Param('inviteUuid') inviteUuid: string): Promise<void> {
    return this.invitesService.deleteInvite(inviteUuid);
  }
}
