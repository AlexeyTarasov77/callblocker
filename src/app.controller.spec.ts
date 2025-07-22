import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhoneInfoEntity, PhoneStatus } from './entities';
import { faker } from '@faker-js/faker';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService)
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
    it('test lookup phone info', async () => {
      const testPhoneNumber = faker.phone.number({ style: "international" })
      const mockPhoneInfo = Object.assign(new PhoneInfoEntity(), {
        phone_number: testPhoneNumber,
        status: faker.helpers.arrayElement(Object.values(PhoneStatus)),
        description: faker.lorem.sentence(),
        source: faker.internet.domainName(),
        created_at: new Date(),
        updated_at: new Date(),
      });
      const usecaseMock = jest.spyOn(appService, "lookupPhoneInfo").mockResolvedValue(mockPhoneInfo)
      const expectedResponse = {
        number: mockPhoneInfo.phone_number,
        status: mockPhoneInfo.status,
        description: mockPhoneInfo.description,
        last_updated: mockPhoneInfo.updated_at
      }
      expect(await appController.lookup(testPhoneNumber)).toEqual(expectedResponse)
      expect(usecaseMock).toHaveBeenCalledWith(testPhoneNumber)
    })
  });
});
