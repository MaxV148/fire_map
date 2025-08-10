import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { Issue } from './entities/issue.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { IssueOwnerOrAdminGuard } from '../auth/owner-or-admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, Tag, User])],
  controllers: [IssuesController],
  providers: [IssuesService, IssueOwnerOrAdminGuard],
})
export class IssuesModule {}
