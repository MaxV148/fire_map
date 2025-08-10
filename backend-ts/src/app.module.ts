import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TagsModule } from './tags/tags.module';
import { IssuesModule } from './issues/issues.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InvitesModule } from './invites/invites.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './events/entities/event.entity';
import { RolesModule } from './roles/roles.module';
import { OtpSettingsModule } from './otp-settings/otp-settings.module';
import { Vehicle } from './vehicles/entities/vehicle.entity';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Tag } from './tags/entities/tag.entity';
import { OtpSettings } from './otp-settings/entities/otp-setting.entity';
import { Issue } from './issues/entities/issue.entity';
import { Invite } from './invites/entities/invite.entity';
import { RedisModule } from '@nestjs-modules/ioredis';
import { SessionModule } from './session/session.module';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('redis.url'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [Event, Vehicle, User, Role, Tag, OtpSettings, Issue, Invite],
        synchronize: false,
      }),
    }),
    EventsModule,
    TagsModule,
    IssuesModule,
    VehiclesModule,
    UsersModule,
    AuthModule,
    InvitesModule,
    RolesModule,
    OtpSettingsModule,
    SessionModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
