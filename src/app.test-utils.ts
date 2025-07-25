import { faker } from '@faker-js/faker';
import { PhoneInfoEntity, PhoneStatus } from './entities';
import { isValidPhoneNumber } from 'libphonenumber-js'

export const generateE164Number = () => {
  let phoneNumber = faker.phone.number({ style: 'international' })
  while (!isValidPhoneNumber(phoneNumber)) {
    phoneNumber = faker.phone.number({ style: 'international' })
  }
  return phoneNumber
}

export const createFakePhoneInfo = () =>
  Object.assign(new PhoneInfoEntity(), {
    phone_number: generateE164Number(),
    status: faker.helpers.arrayElement(Object.values(PhoneStatus)),
    description: faker.lorem.sentence(),
    source: faker.internet.domainName(),
    created_at: new Date(),
    updated_at: new Date(),
  });
