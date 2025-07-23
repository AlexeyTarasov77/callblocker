import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get()
  async lookupPhoneInfo(phoneNumber: string) {
    const phoneInfo = await this.appService.lookupPhoneInfo(phoneNumber);
    return {
      number: phoneInfo.phone_number,
      status: phoneInfo.status,
      description: phoneInfo.description,
      last_updated: phoneInfo.updated_at,
    };
  }
}
