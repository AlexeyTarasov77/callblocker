jest.mock('./auth.guard.ts');
jest.mock('@nestjs/cache-manager');

import { Test, TestingModule } from '@nestjs/testing';
import { AppController, getPhoneInfoResponse } from './app.controller';
import { AppService, PhoneInfoNotFoundError } from './app.service';
import { createFakePhoneInfo } from './app.test-utils';
import { PhoneStatus } from './entities';
import { faker } from '@faker-js/faker/.';
import { AddPhoneInfoDto, LookupPhoneInfoDto } from './app.dto';
import { CSVImporter, ExcelImporter, InvalidFileContentError } from './app.lib';
import { BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AppController', () => {
  let appController: AppController;
  let appService: Record<keyof AppService, jest.Mock>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            lookupPhoneInfo: jest.fn(),
            addPhoneInfo: jest.fn(),
            importPhoneInfo: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            del: jest.fn()
          }
        }
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get(AppService);
  });

  describe('root', () => {
    it('test lookup phone info - success', async () => {
      const mockPhoneInfo = createFakePhoneInfo();
      appService.lookupPhoneInfo.mockResolvedValue(mockPhoneInfo);
      const expectedResponse = {
        number: mockPhoneInfo.phone_number,
        status: mockPhoneInfo.status,
        description: mockPhoneInfo.description,
        last_updated: mockPhoneInfo.updated_at,
      };
      expect(
        await appController.lookupPhoneInfo(Object.assign(new LookupPhoneInfoDto(), { number: mockPhoneInfo.phone_number })),
      ).toEqual(expectedResponse);
      expect(appService.lookupPhoneInfo).toHaveBeenCalledWith(
        mockPhoneInfo.phone_number,
      );
    });
    it('test lookup phone info - not found', async () => {
      const fakePhoneNumber = faker.phone.number({ style: 'international' });
      appService.lookupPhoneInfo.mockRejectedValue(
        new PhoneInfoNotFoundError(),
      );
      const expectedResponse = {
        number: fakePhoneNumber,
        status: PhoneStatus.UNKNOWN,
        description: null,
      };
      expect(await appController.lookupPhoneInfo(Object.assign(new LookupPhoneInfoDto(), { number: fakePhoneNumber }))).toEqual(
        expectedResponse,
      );
      expect(appService.lookupPhoneInfo).toHaveBeenCalledWith(fakePhoneNumber);
    });
    it('test add phone info - success', async () => {
      const mockPhoneInfo = createFakePhoneInfo();
      appService.addPhoneInfo.mockResolvedValue({ ent: mockPhoneInfo, created: faker.datatype.boolean() });
      const expectedResponse = getPhoneInfoResponse(mockPhoneInfo);
      const dto = Object.assign(new AddPhoneInfoDto(), {
        ...mockPhoneInfo,
        number: mockPhoneInfo.phone_number,
      });
      expect(await appController.addPhoneInfo(dto, { status: jest.fn() } as any)).toEqual(expectedResponse);
      expect(appService.addPhoneInfo).toHaveBeenCalledWith(dto);
    });
    describe('test import phone info', () => {
      it('success - csv', async () => {
        const expectedPhoneInfoEnts = Array.from({
          length: faker.number.int({ min: 3, max: 6 }),
        }).map((_) => createFakePhoneInfo());
        const fakeBuf = Buffer.from([]);
        const expectedResponse =
          expectedPhoneInfoEnts.map(getPhoneInfoResponse);
        appService.importPhoneInfo.mockResolvedValue(expectedPhoneInfoEnts);
        expect(
          await appController.importPhoneInfo({
            buffer: fakeBuf,
            mimetype: 'text/csv',
          } as any),
        ).toEqual(expectedResponse);
        expect(appService.importPhoneInfo).toHaveBeenCalledWith(
          expect.any(CSVImporter),
        );
      });
      it('success - excel', async () => {
        const expectedPhoneInfoEnts = Array.from({
          length: faker.number.int({ min: 3, max: 6 }),
        }).map((_) => createFakePhoneInfo());
        const fakeBuf = Buffer.from([]);
        const expectedResponse =
          expectedPhoneInfoEnts.map(getPhoneInfoResponse);
        appService.importPhoneInfo.mockResolvedValue(expectedPhoneInfoEnts);
        expect(
          await appController.importPhoneInfo({
            buffer: fakeBuf,
            mimetype: 'application/vnd.ms-excel',
          } as any),
        ).toEqual(expectedResponse);
        expect(appService.importPhoneInfo).toHaveBeenCalledWith(
          expect.any(ExcelImporter),
        );
      });
      it('failure - unsupported format', async () => {
        const fakeBuf = Buffer.from([]);
        expect(
          async () =>
            await appController.importPhoneInfo({
              buffer: fakeBuf,
              mimetype: 'unsupported',
            } as any),
        ).rejects.toThrow(BadRequestException);
      });
      it('failure - invalid file contents', async () => {
        const fakeBuf = Buffer.from([]);
        appService.importPhoneInfo.mockRejectedValue(
          new InvalidFileContentError(),
        );
        expect(
          async () =>
            await appController.importPhoneInfo({
              buffer: fakeBuf,
              mimetype: 'text/csv',
            } as any),
        ).rejects.toThrow(BadRequestException);
        expect(appService.importPhoneInfo).toHaveBeenCalledWith(
          expect.any(CSVImporter),
        );
      });
    });
  });
});
