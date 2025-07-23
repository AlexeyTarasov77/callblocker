import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getPhoneInfoResponse } from '../src/app.controller';
import { PhoneInfoRepoToken } from '../src/app.providers';
import { Repository } from 'typeorm';
import { PhoneInfoEntity, PhoneStatus } from '../src/entities';
import { faker } from '@faker-js/faker/.';
import { createFakePhoneInfo } from '../src/app.test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let phoneInfoRepo: Repository<PhoneInfoEntity>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    phoneInfoRepo = app.get(PhoneInfoRepoToken)
  });

  describe("GET /api/lookup", () => {
    it("not found number", async () => {
      const fakePhoneNumber = faker.phone.number({ style: 'international' });
      const expectedResponse = {
        number: fakePhoneNumber,
        status: PhoneStatus.UNKNOWN,
        description: null,
      };
      const resp = await request(app.getHttpServer())
        .get("/api/lookup")
        .query({ number: fakePhoneNumber })
      console.log("BODY", resp.body)
      expect(resp.status).toEqual(200);
      expect(resp.body).toEqual(expectedResponse);
    })
    it("success", async () => {
      const fakePhoneInfo = createFakePhoneInfo()
      await phoneInfoRepo.save(fakePhoneInfo)
      const expectedResponse = getPhoneInfoResponse(fakePhoneInfo);
      expectedResponse.last_updated = expectedResponse.last_updated.toISOString() as any
      const resp = await request(app.getHttpServer())
        .get("/api/lookup")
        .query({ number: fakePhoneInfo.phone_number })
      console.log("BODY", resp.body)
      expect(resp.status).toEqual(200);
      expect(resp.body).toEqual(expectedResponse);
      await phoneInfoRepo.delete({ phone_number: fakePhoneInfo.phone_number })
    })
  })
});
