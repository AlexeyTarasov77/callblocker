import { Test, TestingModule } from '@nestjs/testing';
import { AppService, PhoneInfoNotFoundError } from './app.service';
import { PhoneInfoEntity, PhoneStatus } from './entities';
import { PhoneInfoRepoToken } from './app.providers';
import { Repository } from 'typeorm';
import { creeateFakePhoneInfo } from './app.test-utils';
import { faker } from '@faker-js/faker/.';

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
      const expectedPhoneInfo = creeateFakePhoneInfo()
      phoneInfoRepo.findOneBy.mockResolvedValue(expectedPhoneInfo);
      expect(await appService.lookupPhoneInfo(expectedPhoneInfo.phone_number)).toEqual(
        expectedPhoneInfo,
      );
      expect(phoneInfoRepo.findOneBy).toHaveBeenCalledWith({
        phone_number: expectedPhoneInfo.phone_number,
      });
    });
    it('test lookup phone info - not found', async () => {
      const fakePhoneNumber = faker.phone.number({ style: 'international' })
      phoneInfoRepo.findOneBy.mockResolvedValue(null);
      expect(async () => await appService.lookupPhoneInfo(fakePhoneNumber)).rejects.toThrow(PhoneInfoNotFoundError)
      expect(phoneInfoRepo.findOneBy).toHaveBeenCalledWith({
        phone_number: fakePhoneNumber,
      });
    })
  });
});
