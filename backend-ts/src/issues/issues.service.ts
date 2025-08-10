import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point, Repository } from 'typeorm';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueResponseDto } from './dto/issue-response.dto';
import { Issue } from './entities/issue.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { IssueFilterDto } from './dto/issue-filter.dto';

@Injectable()
@UseGuards(AuthGuard)
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createIssueDto: CreateIssueDto,
    userId: number,
  ): Promise<IssueResponseDto> {
    // Prüfe ob der User existiert
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    const issue = new Issue();
    issue.name = createIssueDto.name;
    issue.description = createIssueDto.description;
    issue.createdBy = user;

    // Setze Location als Point-Objekt
    if (createIssueDto.location) {
      issue.location = {
        type: 'Point',
        coordinates: createIssueDto.location,
      } as Point;
    }

    // Wenn Tag-IDs angegeben sind, lade die Tags und verknüpfe sie
    if (createIssueDto.tagIds && createIssueDto.tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: createIssueDto.tagIds.map((id) => ({ id })),
      });
      issue.tags = tags;
    }

    const savedIssue = await this.issueRepository.save(issue);

    // Lade das Issue mit Tags und createdBy für die Response
    const issueWithRelations = await this.issueRepository.findOne({
      where: { id: savedIssue.id },
      relations: ['tags', 'createdBy'],
    });

    if (!issueWithRelations) {
      throw new NotFoundException('Issue konnte nicht gefunden werden');
    }

    return this.mapToResponseDto(issueWithRelations);
  }

  private mapToResponseDto(issue: Issue): IssueResponseDto {
    return {
      id: issue.id,
      name: issue.name,
      description: issue.description || undefined,
      createdBy: issue.createdBy
        ? {
            id: issue.createdBy.id,
            firstName: issue.createdBy.firstName,
            lastName: issue.createdBy.lastName,
          }
        : undefined,
      createdAt: issue.createdAt,
      tags:
        issue.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })) || [],
      location: issue.location
        ? [
            (issue.location as any).coordinates[0],
            (issue.location as any).coordinates[1],
          ]
        : undefined,
    };
  }

  async findAll(filter?: IssueFilterDto): Promise<IssueResponseDto[]> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 10;
    const qb = this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.tags', 'tag')
      .leftJoinAndSelect('issue.createdBy', 'createdBy');

    if (filter?.name) {
      qb.andWhere('issue.name ILIKE :name', { name: `%${filter.name}%` });
    }

    if (filter?.description) {
      qb.andWhere('issue.description ILIKE :description', {
        description: `%${filter.description}%`,
      });
    }

    if (filter?.tagIds && filter.tagIds.length > 0) {
      qb.andWhere('tag.id IN (:...tagIds)', { tagIds: filter.tagIds });
    }

    if (filter?.startDate) {
      qb.andWhere('issue.createdAt >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter?.endDate) {
      qb.andWhere('issue.createdAt <= :endDate', { endDate: filter.endDate });
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('issue.createdAt', 'DESC');

    const entities = await qb.getMany();

    return entities.map((i) => this.mapToResponseDto(i));
  }

  async findOne(id: number): Promise<IssueResponseDto> {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['tags', 'createdBy'],
    });

    if (!issue) {
      throw new NotFoundException('Issue nicht gefunden');
    }

    return this.mapToResponseDto(issue);
  }

  async update(
    id: number,
    updateIssueDto: UpdateIssueDto,
  ): Promise<IssueResponseDto> {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!issue) {
      throw new NotFoundException('Issue nicht gefunden');
    }

    // Berechtigung wird bereits durch den Guard geprüft

    // Update Issue-Eigenschaften
    if (updateIssueDto.name !== undefined) {
      issue.name = updateIssueDto.name;
    }
    if (updateIssueDto.description !== undefined) {
      issue.description = updateIssueDto.description;
    }

    // Update Location
    if (updateIssueDto.location) {
      issue.location = {
        type: 'Point',
        coordinates: updateIssueDto.location,
      } as Point;
    }

    // Update Tags
    if (updateIssueDto.tagIds !== undefined) {
      if (updateIssueDto.tagIds.length > 0) {
        const tags = await this.tagRepository.find({
          where: updateIssueDto.tagIds.map((tagId) => ({ id: tagId })),
        });
        issue.tags = tags;
      } else {
        issue.tags = [];
      }
    }

    const savedIssue = await this.issueRepository.save(issue);

    // Lade das aktualisierte Issue mit Relations
    const updatedIssue = await this.issueRepository.findOne({
      where: { id: savedIssue.id },
      relations: ['tags', 'createdBy'],
    });

    if (!updatedIssue) {
      throw new NotFoundException('Issue konnte nicht aktualisiert werden');
    }

    return this.mapToResponseDto(updatedIssue);
  }

  async remove(id: number): Promise<void> {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!issue) {
      throw new NotFoundException('Issue nicht gefunden');
    }

    // Berechtigung wird bereits durch den Guard geprüft

    await this.issueRepository.remove(issue);
  }
}
