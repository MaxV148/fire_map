import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Invite } from './entities/invite.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import SignUtils from '../common/sign';
import { Request } from 'express';
import { InviteListDto, InviteResponseDto } from './dto/invite-response.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class InvitesService {
  public constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  public async createInvite(
    createInviteDto: CreateInviteDto,
    request: Request,
    currentUserId: string,
  ): Promise<InviteResponseDto> {
    const creator: User | null = await this.userRepository.findOne({
      where: { id: Number(currentUserId) },
    });
    if (!creator) {
      throw new BadRequestException('Creator not found');
    }

    const existingInvite: Invite | null = await this.inviteRepository.findOne({
      where: { email: createInviteDto.email, isUsed: false },
    });
    if (existingInvite) {
      throw new BadRequestException(
        'An active invitation already exists for this email',
      );
    }

    const expireDays: number = createInviteDto.expireDays ?? 7;
    const expireDate: Date = new Date(
      Date.now() + expireDays * 24 * 60 * 60 * 1000,
    );
    const invite: Invite = this.inviteRepository.create({
      email: createInviteDto.email,
      inviteUuid: randomUUID(),
      expireDate,
      isUsed: false,
      createdBy: creator,
    });
    const saved: Invite = await this.inviteRepository.save(invite);

    const baseUrl: string = `${request.protocol}://${request.get('host')}`;
    const token: string = SignUtils.createSignedToken(
      saved.inviteUuid,
      process.env.HMAC_SECRET ?? 'dev-secret',
    );
    const inviteLink: string = `${baseUrl}/register?invitation=${token}`;
    await this.mailService.sendInviteEmail({ to: saved.email, inviteLink });

    return this.mapInviteToResponse(saved);
  }

  public async listInvites(
    skip: number = 0,
    limit: number = 100,
  ): Promise<InviteListDto> {
    const [invites, count]: [Invite[], number] =
      await this.inviteRepository.findAndCount({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
    return { invites: invites.map(this.mapInviteToResponse), count };
  }

  public async getInviteByUuid(inviteUuid: string): Promise<InviteResponseDto> {
    const invite: Invite | null = await this.inviteRepository.findOne({
      where: { inviteUuid },
    });
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }
    return this.mapInviteToResponse(invite);
  }

  public async deleteInvite(inviteUuid: string): Promise<void> {
    const invite: Invite | null = await this.inviteRepository.findOne({
      where: { inviteUuid },
    });
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }
    await this.inviteRepository.remove(invite);
  }

  private mapInviteToResponse = (invite: Invite): InviteResponseDto => ({
    id: invite.id,
    inviteUuid: invite.inviteUuid,
    email: invite.email,
    expireDate: invite.expireDate,
    createdAt: invite.createdAt,
    isUsed: invite.isUsed,
  });
}
