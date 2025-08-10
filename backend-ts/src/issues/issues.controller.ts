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
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { UserId } from '../decorators/user-id.decorator';
import { IssueOwnerOrAdminGuard } from '../auth/owner-or-admin.guard';
import { IssueFilterDto } from './dto/issue-filter.dto';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  create(@Body() createIssueDto: CreateIssueDto, @UserId() userId: string) {
    return this.issuesService.create(createIssueDto, +userId);
  }

  @Get()
  findAll(@Query() filter: IssueFilterDto) {
    return this.issuesService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(IssueOwnerOrAdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
  ) {
    return this.issuesService.update(+id, updateIssueDto);
  }

  @Delete(':id')
  @UseGuards(IssueOwnerOrAdminGuard)
  remove(@Param('id') id: string) {
    return this.issuesService.remove(+id);
  }
}
