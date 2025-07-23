import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService, PhoneInfoNotFoundError } from './app.service';
import { creeateFakePhoneInfo } from './app.test-utils';
import { PhoneStatus } from './entities';
import { faker } from '@faker-js/faker/.';

describe('AppController', () => {
  let appController: AppController;
  let appService: Record<keyof AppService, jest.Mock>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{
        provide: AppService,
        useValue: {
          lookupPhoneInfo: jest.fn()
        }
      }],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get(AppService);
  });

  describe('root', () => {
    it('test lookup phone info - success', async () => {
      const mockPhoneInfo = creeateFakePhoneInfo()
      appService.lookupPhoneInfo.mockResolvedValue(mockPhoneInfo);
      const expectedResponse = {
        number: mockPhoneInfo.phone_number,
        status: mockPhoneInfo.status,
        description: mockPhoneInfo.description,
        last_updated: mockPhoneInfo.updated_at,
      };
      expect(await appController.lookupPhoneInfo(mockPhoneInfo.phone_number)).toEqual(
        expectedResponse,
      );
      expect(appService.lookupPhoneInfo).toHaveBeenCalledWith(mockPhoneInfo.phone_number);
    });
    it('test lookup phone info - not found', async () => {
      const fakePhoneNumber = faker.phone.number({ style: 'international' })
      appService.lookupPhoneInfo.mockRejectedValue(new PhoneInfoNotFoundError());
      const expectedResponse = {
        number: fakePhoneNumber,
        status: PhoneStatus.UNKNOWN,
        description: null,
      };
      expect(await appController.lookupPhoneInfo(fakePhoneNumber)).toEqual(
        expectedResponse,
      );
      expect(appService.lookupPhoneInfo).toHaveBeenCalledWith(fakePhoneNumber);
    });
  });
});
