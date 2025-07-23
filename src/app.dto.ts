import { IsEnum, IsOptional, IsPhoneNumber, MinLength } from 'class-validator';
import { PhoneStatus } from './entities';

export class AddPhoneInfoDto {
  @IsPhoneNumber()
  number: string;

  @IsEnum(PhoneStatus)
  status: PhoneStatus;

  @MinLength(5)
  description: string;

  @IsOptional()
  source?: string;
}
