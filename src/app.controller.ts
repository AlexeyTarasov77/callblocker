import { Controller, Get } from '@nestjs/common';
import { AppService, PhoneInfoNotFoundError } from './app.service';
import { PhoneStatus } from './entities';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get()
  async lookupPhoneInfo(phoneNumber: string) {
    try {
      const phoneInfo = await this.appService.lookupPhoneInfo(phoneNumber);
      return {
        number: phoneInfo.phone_number,
        status: phoneInfo.status,
        description: phoneInfo.description,
        last_updated: phoneInfo.updated_at,
      };
    } catch (err) {
      if (err instanceof PhoneInfoNotFoundError) {
        return {
          number: phoneNumber,
          status: PhoneStatus.UNKNOWN,
          description: null,
        }
      }
    }
  }
}
