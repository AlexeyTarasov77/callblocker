import { DataSource } from 'typeorm';
import { PhoneInfoEntity } from './entities';

export const PhoneInfoRepoToken = 'PHONE_INFO_REPO';

export const providers = [
  {
    provide: PhoneInfoRepoToken,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PhoneInfoEntity),
    inject: [DataSource],
  },
];
