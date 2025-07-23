import { DataSource } from 'typeorm';
import { ApiKeyEntity, PhoneInfoEntity } from './entities';

export const PhoneInfoRepoToken = 'PHONE_INFO_REPO';
export const ApiKeyRepoToken = 'API_KEY_REPO';

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
];
