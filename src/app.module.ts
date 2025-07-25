import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyEntity, PhoneInfoEntity } from './entities';
import { providers } from './app.providers';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { LoggerMiddleware } from './logger.middleware';
import { RequestLogEntity } from './entities/request-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [PhoneInfoEntity, ApiKeyEntity, RequestLogEntity],
      synchronize: true,
    }),
    CacheModule.registerAsync({
      useFactory: async () => {
        const fiveMinsMs = 5 * 60 * 1000;
        return {
          store: createKeyv(process.env.REDIS_URL),
          ttl: fiveMinsMs,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [...providers, AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
