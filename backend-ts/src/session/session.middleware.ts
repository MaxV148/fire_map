import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, NextFunction } from 'express';
import { SessionService } from './session.service';
import { AuthenticatedRequest } from '../types/request.interface';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Hole Cookie-Namen aus der Konfiguration
      const cookieName = this.configService.get<string>(
        'session.cookieName',
        'sessionId',
      );

      // Extrahiere Session-ID aus dem Cookie
      const sessionId = req.cookies?.[cookieName];

      if (!sessionId) {
        throw new UnauthorizedException('Keine gültige Session gefunden');
      }

      // Prüfe Session in Redis
      const sessionData = await this.sessionService.getSession(sessionId);

      if (!sessionData) {
        throw new UnauthorizedException('Session ist ungültig oder abgelaufen');
      }

      // Füge userId und Rolle zum Request hinzu
      req.userId = sessionData.userId;
      req.userRole = sessionData.role;

      next();
    } catch (error) {
      // Bei Fehlern wird eine UnauthorizedException geworfen
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Für alle anderen Fehler
      throw new UnauthorizedException('Fehler bei der Session-Validierung');
    }
  }
}
