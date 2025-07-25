import { Request, Response, NextFunction } from 'express';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { RequestLogRepoToken } from './app.providers';
import { Repository } from 'typeorm';
import { RequestLogEntity } from './entities/request-log.entity';


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  @Inject(RequestLogRepoToken) private logRepo: Repository<RequestLogEntity>

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = performance.now();
    next();
    const processingTime = (performance.now() - startTime) / 1000;
    // this should be handled manually because otherwise nest js tries to send 500 response which fails because response was already sent
    try {
      await this.logRepo.insert({ ip: req.ip, processing_time: processingTime })
    } catch (err) {
      console.error("Failed to save request log", err)
    }
  }
}

