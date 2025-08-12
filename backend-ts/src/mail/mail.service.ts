import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface SendInviteEmailParams {
  to: string;
  inviteLink: string;
}

interface SendResetPasswordEmailParams {
  to: string;
  resetLink: string;
}

interface SendForgotPasswordCodeEmailParams {
  to: string;
  code: string;
}

@Injectable()
export class MailService {
  public constructor(private readonly mailerService: MailerService) {}

  public async sendInviteEmail(params: SendInviteEmailParams): Promise<void> {
    await this.mailerService.sendMail({
      to: params.to,
      subject: 'Einladung zu Fire Map',
      template: 'invite',
      context: { invite_link: params.inviteLink },
    });
  }

  public async sendResetPasswordEmail(
    params: SendResetPasswordEmailParams,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: params.to,
      subject: 'Passwort zurücksetzen',
      template: 'reset_pw',
      context: { reset_link: params.resetLink },
    });
  }

  public async sendForgotPasswordCodeEmail(
    params: SendForgotPasswordCodeEmailParams,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: params.to,
      subject: 'Dein Verifikationscode',
      template: 'forgot_password',
      context: { code: params.code },
    });
  }
}
