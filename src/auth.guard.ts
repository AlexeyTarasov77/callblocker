import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ApiKeyRepoToken } from './app.providers';
import { Repository } from 'typeorm';
import { ApiKeyEntity } from './entities';
import { Request } from 'express';

export const ApiKeyHeaderName = 'x-api-key';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(ApiKeyRepoToken)
  private apiKeyRepo: Repository<ApiKeyEntity>;
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyValue = request.headers[ApiKeyHeaderName];
    if (!apiKeyValue) return false;
    const apiKeyEnt = await this.apiKeyRepo.findOneBy({
      key: String(apiKeyValue),
    });
    if (!apiKeyEnt) return false;
    return true;
  }
}
