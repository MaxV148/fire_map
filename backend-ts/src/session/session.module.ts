import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionMiddleware } from './session.middleware';

@Module({
  providers: [SessionService, SessionMiddleware],
  exports: [SessionService, SessionMiddleware],
})
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .exclude(
        // Login und Register Routen ausschließen
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        // Healthcheck oder andere öffentliche Routen können hier hinzugefügt werden
      )
      .forRoutes('*'); // Auf alle anderen Routen anwenden
  }
}
