import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { createHash, randomBytes } from 'crypto';
import { SessionDto } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async createSession(
    sessionId: string,
    expireAfterSec: number,
    sessionData: SessionDto,
  ): Promise<void> {
    await this.redis.setex(
      sessionId,
      expireAfterSec,
      JSON.stringify(sessionData),
    );
  }

  async getSession(sessionId: string): Promise<SessionDto | null> {
    const sessionData = await this.redis.get(sessionId);

    if (!sessionData) {
      return null;
    }

    const parsedData: any = JSON.parse(sessionData);
    return new SessionDto(
      parsedData.userId,
      parsedData.role,
      parsedData.createdAt,
      parsedData.twoFactorPending,
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(sessionId);
  }

  generateSecureSessionId(): string {
    const randomData = randomBytes(32);
    const timestamp = Date.now().toString();
    const combined = Buffer.concat([
      randomData,
      Buffer.from(timestamp, 'utf8'),
    ]);

    const hash = createHash('sha256').update(combined).digest();
    return hash.toString('base64');
  }
}
