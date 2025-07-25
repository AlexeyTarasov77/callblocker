import { DataSource } from 'typeorm';
import { ApiKeyEntity, PhoneInfoEntity } from './entities';
import { RequestLogEntity } from './entities/request-log.entity';

export const PhoneInfoRepoToken = 'PHONE_INFO_REPO';
export const ApiKeyRepoToken = 'API_KEY_REPO';
export const RequestLogRepoToken = 'REQUEST_LOG_REPO';

export const providers = [
  {
    provide: PhoneInfoRepoToken,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PhoneInfoEntity),
    inject: [DataSource],
  },
  {
    provide: ApiKeyRepoToken,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ApiKeyEntity),
    inject: [DataSource],
  },
  {
    provide: RequestLogRepoToken,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RequestLogEntity),
    inject: [DataSource],
  },
];
