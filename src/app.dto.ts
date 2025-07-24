import { IsEnum, IsOptional, IsPhoneNumber, MinLength } from 'class-validator';
import { PhoneStatus } from './entities';
import { Transform } from 'class-transformer';

export class AddPhoneInfoDto {
  @Transform(({ value }) => !String(value).startsWith("+") ? "+" + String(value) : value)
  @IsPhoneNumber()
  number: string;

  @Transform(({ value }) => String(value).toLowerCase())
  @IsEnum(PhoneStatus)
  status: PhoneStatus;

  @MinLength(5)
  description: string;

  @IsOptional()
  source?: string;
}
