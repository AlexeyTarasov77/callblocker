import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getPhoneInfoResponse } from '../src/app.controller';
import { ApiKeyRepoToken, PhoneInfoRepoToken } from '../src/app.providers';
import { Repository } from 'typeorm';
import { ApiKeyEntity, PhoneInfoEntity, PhoneStatus } from '../src/entities';
import { createFakePhoneInfo, generateE164Number } from '../src/app.test-utils';
import { AddPhoneInfoDto } from '../src/app.dto';
import { ApiKeyHeaderName } from '../src/auth.guard';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker/.';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let phoneInfoRepo: Repository<PhoneInfoEntity>;
  let apiKeyRepo: Repository<ApiKeyEntity>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    phoneInfoRepo = app.get(PhoneInfoRepoToken);
    apiKeyRepo = app.get(ApiKeyRepoToken);
  });

  describe('GET /api/lookup', () => {
    it('not found number', async () => {
      const fakePhoneNumber = generateE164Number()
      const expectedResponse = {
        number: fakePhoneNumber,
        status: PhoneStatus.UNKNOWN,
        description: null,
      };
      const resp = await request(app.getHttpServer())
        .get('/api/lookup')
        .query({ number: fakePhoneNumber });
      expect(resp.status).toEqual(200);
      expect(resp.body).toEqual(expectedResponse);
    });
    it('invalid number', async () => {
      const resp = await request(app.getHttpServer())
        .get('/api/lookup')
        .query({ number: 123 });
      expect(resp.status).toEqual(400);
    });
    it('empty number', async () => {
      const resp = await request(app.getHttpServer())
        .get('/api/lookup')
      expect(resp.status).toEqual(400);
    });
    it('success', async () => {
      const fakePhoneInfo = createFakePhoneInfo();
      await phoneInfoRepo.save(fakePhoneInfo);
      const expectedResponse = getPhoneInfoResponse(fakePhoneInfo);
      expectedResponse.last_updated =
        expectedResponse.last_updated.toISOString() as any;
      const resp = await request(app.getHttpServer())
        .get('/api/lookup')
        .query({ number: fakePhoneInfo.phone_number });
      expect(resp.status).toEqual(200);
      expect(resp.body).toEqual(expectedResponse);
      await phoneInfoRepo.delete({ phone_number: fakePhoneInfo.phone_number });
    });
    it('check changes after update (cache invalidation)', async () => {
      const fakePhoneInfo = createFakePhoneInfo();
      await phoneInfoRepo.save(fakePhoneInfo);
      const expectedResponse = getPhoneInfoResponse(fakePhoneInfo);
      expectedResponse.last_updated =
        expectedResponse.last_updated.toISOString() as any;
      let resp = await request(app.getHttpServer())
        .get('/api/lookup')
        .query({ number: fakePhoneInfo.phone_number });
      expect(resp.status).toEqual(200);
      expect(resp.body).toEqual(expectedResponse);
      const updatedDescription = faker.lorem.sentence()
      let apiKey = apiKeyRepo.create({ key: randomUUID() });
      apiKey = await apiKeyRepo.save(apiKey);
      // update, which should invalidate cache
      resp = await request(app.getHttpServer())
        .post('/api/admin/add')
        .send({
          ...fakePhoneInfo,
          number: fakePhoneInfo.phone_number,
          description: updatedDescription
        })
        .set('Content-Type', 'application/json')
        .set(ApiKeyHeaderName, apiKey.key);
      expect(resp.status).toEqual(200)
      resp = await request(app.getHttpServer())
        .get('/api/lookup')
        .query({ number: fakePhoneInfo.phone_number });
      expect(resp.status).toEqual(200);

      expect(resp.body.description).toEqual(updatedDescription)
      expect(resp.headers["x-cache"]).toEqual("MISS")

      await phoneInfoRepo.delete({ phone_number: fakePhoneInfo.phone_number });
      await apiKeyRepo.delete({ key: apiKey.key });
    })
  });

  describe('POST /api/admin/add', () => {
    it('success', async () => {
      let apiKey = apiKeyRepo.create({ key: randomUUID() });
      apiKey = await apiKeyRepo.save(apiKey);
      const fakePhoneInfo = createFakePhoneInfo();
      const dto = Object.assign(new AddPhoneInfoDto(), {
        ...fakePhoneInfo,
        phone_number: undefined,
        number: fakePhoneInfo.phone_number,
      });
      const expectedResponse = getPhoneInfoResponse(fakePhoneInfo);
      expectedResponse.last_updated =
        expectedResponse.last_updated.toISOString() as any;
      const resp = await request(app.getHttpServer())
        .post('/api/admin/add')
        .send(dto)
        .set('Content-Type', 'application/json')
        .set(ApiKeyHeaderName, apiKey.key);
      expect(resp.status).toEqual(201);
      expect(resp.body).toEqual(expectedResponse);

      await apiKeyRepo.delete({ key: apiKey.key });
    });
    it('success - updated', async () => {
      let apiKey = apiKeyRepo.create({ key: randomUUID() });
      apiKey = await apiKeyRepo.save(apiKey);
      const fakePhoneInfo = createFakePhoneInfo();
      await phoneInfoRepo.insert(fakePhoneInfo)
      const dto = Object.assign(new AddPhoneInfoDto(), {
        ...fakePhoneInfo,
        phone_number: undefined,
        number: fakePhoneInfo.phone_number,
      });
      const expectedResponse = getPhoneInfoResponse(fakePhoneInfo);
      expectedResponse.last_updated =
        expectedResponse.last_updated.toISOString() as any;
      const resp = await request(app.getHttpServer())
        .post('/api/admin/add')
        .send(dto)
        .set('Content-Type', 'application/json')
        .set(ApiKeyHeaderName, apiKey.key);
      expect(resp.status).toEqual(200);
      expect(resp.body).toEqual(expectedResponse);

      await apiKeyRepo.delete({ key: apiKey.key });
    });
    it('invalid phone number', async () => {
      let apiKey = apiKeyRepo.create({ key: randomUUID() });
      apiKey = await apiKeyRepo.save(apiKey);
      const fakePhoneInfo = createFakePhoneInfo();
      const dto = Object.assign(new AddPhoneInfoDto(), {
        ...fakePhoneInfo,
        number: '0123456789',
      });
      const resp = await request(app.getHttpServer())
        .post('/api/admin/add')
        .send(dto)
        .set('Content-Type', 'application/json')
        .set(ApiKeyHeaderName, apiKey.key);
      expect(resp.status).toEqual(400);

      await apiKeyRepo.delete({ key: apiKey.key });
    });
    it('access denied', async () => {
      const resp = await request(app.getHttpServer())
        .post('/api/admin/add')
        .send({});
      expect(resp.status).toEqual(403);
    });
  });
});
