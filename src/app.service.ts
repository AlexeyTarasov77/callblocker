import { Injectable } from '@nestjs/common';
import { PhoneInfoEntity } from './entities';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async lookupPhoneInfo(phoneNumber: string): Promise<PhoneInfoEntity> {
    return new PhoneInfoEntity()
  }
}
