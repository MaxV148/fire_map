import { IsString } from 'class-validator';

export class RegisterDtoQuery {
  @IsString()
  invitation: string;
}
