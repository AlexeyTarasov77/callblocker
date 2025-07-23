import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhoneInfoEntity, PhoneStatus } from './entities';
import { faker } from '@faker-js/faker';
import { creeateFakePhoneInfo } from './app.test-utils';

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
    it('test lookup phone info', async () => {
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
  });
});
