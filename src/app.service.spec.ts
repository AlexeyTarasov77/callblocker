import { Test, TestingModule } from '@nestjs/testing';
import { AppService, PhoneInfoNotFoundError } from './app.service';
import { PhoneInfoEntity } from './entities';
import { PhoneInfoRepoToken } from './app.providers';
import { Repository } from 'typeorm';
import { createFakePhoneInfo } from './app.test-utils';
import { faker } from '@faker-js/faker/.';
import { AddPhoneInfoDto } from './app.dto';

describe('AppService', () => {
  let appService: AppService;
  let phoneInfoRepo: Record<keyof Repository<PhoneInfoEntity>, jest.Mock>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PhoneInfoRepoToken,
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            upsert: jest.fn(),
            existsBy: jest.fn()
          },
        },
        AppService,
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
    phoneInfoRepo = app.get<typeof phoneInfoRepo>(PhoneInfoRepoToken);
  });

  describe('root', () => {
    it('test lookup phone info - success', async () => {
      const expectedPhoneInfo = createFakePhoneInfo();
      phoneInfoRepo.findOneBy.mockResolvedValue(expectedPhoneInfo);
      expect(
        await appService.lookupPhoneInfo(expectedPhoneInfo.phone_number),
      ).toEqual(expectedPhoneInfo);
      expect(phoneInfoRepo.findOneBy).toHaveBeenCalledWith({
        phone_number: expectedPhoneInfo.phone_number,
      });
    });
    it('test lookup phone info - not found', async () => {
      const fakePhoneNumber = faker.phone.number({ style: 'international' });
      phoneInfoRepo.findOneBy.mockResolvedValue(null);
      expect(
        async () => await appService.lookupPhoneInfo(fakePhoneNumber),
      ).rejects.toThrow(PhoneInfoNotFoundError);
      expect(phoneInfoRepo.findOneBy).toHaveBeenCalledWith({
        phone_number: fakePhoneNumber,
      });
    });
    it('test add phone info', async () => {
      const expectedPhoneInfo = createFakePhoneInfo();
      const fakeIsExists = faker.datatype.boolean()
      const dto = Object.assign(new AddPhoneInfoDto(), {
        ...expectedPhoneInfo,
        number: expectedPhoneInfo.phone_number,
      });
      phoneInfoRepo.create.mockReturnValue(expectedPhoneInfo);
      phoneInfoRepo.upsert.mockResolvedValue({ generatedMaps: {} });
      phoneInfoRepo.existsBy.mockResolvedValue(fakeIsExists)
      expect(await appService.addPhoneInfo(dto)).toEqual({ ent: expectedPhoneInfo, created: !fakeIsExists });
      expect(phoneInfoRepo.create).toHaveBeenCalledWith(dto);
      expect(phoneInfoRepo.upsert).toHaveBeenCalledWith(expectedPhoneInfo, ["phone_number"]);
    });
    it('test import phone info', async () => {
      const importedData = Array.from({
        length: faker.number.int({ min: 3, max: 6 }),
      }).map((_) => {
        const expectedPhoneInfo = createFakePhoneInfo();
        return Object.assign(new AddPhoneInfoDto(), {
          ...expectedPhoneInfo,
          number: expectedPhoneInfo.phone_number,
        });
      });
      const mockDataImport = jest.fn().mockResolvedValue(importedData);
      phoneInfoRepo.upsert.mockResolvedValue({
        generatedMaps: Array.from({ length: importedData.length }).map((_) => ({
          id: faker.number.int(),
          created_at: faker.date.recent(),
          updated_at: faker.date.recent(),
        })),
      });
      await appService.importPhoneInfo({ import: mockDataImport });
      expect(mockDataImport).toHaveBeenCalled();
      expect(phoneInfoRepo.upsert).toHaveBeenCalledWith(importedData, [
        'phone_number',
      ]);
    });
  });
});
