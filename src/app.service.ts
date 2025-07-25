import { Inject, Injectable } from '@nestjs/common';
import { PhoneInfoEntity } from './entities';
import { Repository } from 'typeorm';
import { PhoneInfoRepoToken } from './app.providers';
import { AddPhoneInfoDto } from './app.dto';
import { PhoneInfoImporter } from './app.lib';

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

  async addPhoneInfo(dto: AddPhoneInfoDto): Promise<{ ent: PhoneInfoEntity, created: boolean }> {
    const isExists = await this.phoneInfoRepo.existsBy({ phone_number: dto.number })
    const ent = this.phoneInfoRepo.create({ ...dto, phone_number: dto.number });
    const res = await this.phoneInfoRepo.upsert(ent, ["phone_number"])
    return { ent: { ...ent, ...res.generatedMaps[0] }, created: !isExists }
  }
  async importPhoneInfo(
    importer: PhoneInfoImporter,
  ): Promise<PhoneInfoEntity[]> {
    const payload = await importer.import();
    const data = await this.phoneInfoRepo.upsert(
      payload.map((dto) => ({ ...dto, phone_number: dto.number })),
      ['phone_number'],
    );
    return payload.map((dto, i) => ({
      ...dto,
      ...data.generatedMaps[i],
      phone_number: dto.number,
      id: data.generatedMaps[i].id,
      created_at: data.generatedMaps[i].created_at,
      updated_at: data.generatedMaps[i].updated_at,
    }));
  }
}
