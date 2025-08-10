import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedRequest } from '../types/request.interface';
import { Event } from '../events/entities/event.entity';
import { Issue } from '../issues/entities/issue.entity';

@Injectable()
export class EventOwnerOrAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { userId, userRole } = request;

    if (!userId || !userRole) {
      throw new ForbiddenException('Authentication required');
    }

    // Admin hat immer Zugriff
    if (userRole === 'admin') {
      return true;
    }

    // Hole die Event-ID aus den Parametern
    const params = request.params;
    const eventId = params.id;

    if (!eventId) {
      throw new ForbiddenException('Event ID not found');
    }

    // Lade das Event mit dem Ersteller
    const event = await this.eventRepository.findOne({
      where: { id: +eventId },
      relations: ['createdBy'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Prüfe ob der User der Ersteller ist
    if (event.createdBy.id !== +userId) {
      throw new ForbiddenException('No permission to this event');
    }

    return true;
  }
}

@Injectable()
export class IssueOwnerOrAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { userId, userRole } = request;

    if (!userId || !userRole) {
      throw new ForbiddenException('Authentication required');
    }

    // Admin hat immer Zugriff
    if (userRole === 'admin') {
      return true;
    }

    // Hole die Issue-ID aus den Parametern
    const params = request.params;
    const issueId = params.id;

    if (!issueId) {
      throw new ForbiddenException('Issue ID not found');
    }

    // Lade das Issue mit dem Ersteller
    const issue = await this.issueRepository.findOne({
      where: { id: +issueId },
      relations: ['createdBy'],
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Prüfe ob der User der Ersteller ist
    if (issue.createdBy.id !== +userId) {
      throw new ForbiddenException('No permission to this issue');
    }

    return true;
  }
}
