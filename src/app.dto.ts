import { IsEnum, IsPhoneNumber, MinLength } from 'class-validator';
import { PhoneStatus } from './entities';

export class AddPhoneInfoDto {
  @IsPhoneNumber()
  number: string;

  @IsEnum(PhoneStatus)
  status: PhoneStatus;

  @MinLength(5)
  description: string;

  source?: string;
}
