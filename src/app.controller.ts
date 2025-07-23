import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService, PhoneInfoNotFoundError } from './app.service';
import { PhoneInfoEntity, PhoneStatus } from './entities';
import { AddPhoneInfoDto } from './app.dto';
import { AuthGuard } from './auth.guard';

export const getPhoneInfoResponse = (phoneInfo: PhoneInfoEntity) => ({
  number: phoneInfo.phone_number,
  status: phoneInfo.status,
  description: phoneInfo.description,
  last_updated: phoneInfo.updated_at,
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/lookup')
  async lookupPhoneInfo(phoneNumber: string) {
    try {
      const phoneInfo = await this.appService.lookupPhoneInfo(phoneNumber);
      return getPhoneInfoResponse(phoneInfo);
    } catch (err) {
      if (err instanceof PhoneInfoNotFoundError) {
        return {
          number: phoneNumber,
          status: PhoneStatus.UNKNOWN,
          description: null,
        };
      }
    }
  }
  @Post('/admin/add')
  @UseGuards(AuthGuard)
  async addPhoneInfo(@Body() dto: AddPhoneInfoDto) {
    const phoneInfo = await this.appService.addPhoneInfo(dto);
    return getPhoneInfoResponse(phoneInfo);
  }
}
