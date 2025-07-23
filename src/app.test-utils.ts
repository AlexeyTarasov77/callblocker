import { faker } from '@faker-js/faker';
import { PhoneInfoEntity, PhoneStatus } from './entities';

export const createFakePhoneInfo = () =>
  Object.assign(new PhoneInfoEntity(), {
    phone_number: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement(Object.values(PhoneStatus)),
    description: faker.lorem.sentence(),
    source: faker.internet.domainName(),
    created_at: new Date(),
    updated_at: new Date(),
  });
