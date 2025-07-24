import { BadRequestException, Body, Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService, PhoneInfoNotFoundError } from './app.service';
import { PhoneInfoEntity, PhoneStatus } from './entities';
import { AddPhoneInfoDto } from './app.dto';
import { AuthGuard } from './auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { CSVImporter, ExcelImporter, InvalidFileContentError, PhoneInfoImporter } from './app.lib';

export const getPhoneInfoResponse = (phoneInfo: PhoneInfoEntity) => ({
  number: phoneInfo.phone_number,
  status: phoneInfo.status,
  description: phoneInfo.description,
  last_updated: phoneInfo.updated_at,
});

@Controller("/api")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/lookup')
  @UseInterceptors(CacheInterceptor)
  async lookupPhoneInfo(@Query("number") number: string) {
    try {
      const phoneInfo = await this.appService.lookupPhoneInfo(number);
      return getPhoneInfoResponse(phoneInfo);
    } catch (err) {
      if (err instanceof PhoneInfoNotFoundError) {
        return {
          number: number,
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
  @Post('/admin/import')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importPhoneInfo(@UploadedFile() file: Express.Multer.File) {
    const isCsv = file.mimetype.includes('csv');
    const isExcel = file.mimetype.includes('spreadsheetml') || file.mimetype.includes('excel');
    if (!isCsv && !isExcel) {
      throw new BadRequestException('Invalid file type. Only CSV and Excel files are supported.');
    }
    let importer: PhoneInfoImporter;
    if (isCsv) {
      importer = new CSVImporter(file.buffer)
    } else if (isExcel) {
      importer = new ExcelImporter(file.buffer)
    }
    try {

      const phoneInfoEntities = await this.appService.importPhoneInfo(importer)
      return phoneInfoEntities.map(getPhoneInfoResponse)
    } catch (err) {
      if (err instanceof InvalidFileContentError) {
        throw new BadRequestException(err.message)
      }
      throw err
    }
  }
}
