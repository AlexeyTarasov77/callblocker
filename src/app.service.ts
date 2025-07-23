import { Inject, Injectable } from '@nestjs/common';
import { PhoneInfoEntity } from './entities';
import { Repository } from 'typeorm';
import { PhoneInfoRepoToken } from './app.providers';
import { AddPhoneInfoDto } from './app.dto';

export class PhoneInfoNotFoundError extends Error {
  constructor() {
    super('Phone info not found');
  }
}

@Injectable()
export class AppService {
  @Inject(PhoneInfoRepoToken)
  private phoneInfoRepo: Repository<PhoneInfoEntity>;
  async lookupPhoneInfo(phoneNumber: string): Promise<PhoneInfoEntity> {
    const res = await this.phoneInfoRepo.findOneBy({
      phone_number: phoneNumber,
    });
    if (!res) throw new PhoneInfoNotFoundError();
    return res;
  }

  async addPhoneInfo(dto: AddPhoneInfoDto): Promise<PhoneInfoEntity> {
    const ent = this.phoneInfoRepo.create(dto);
    return await this.phoneInfoRepo.save(ent);
  }
}
