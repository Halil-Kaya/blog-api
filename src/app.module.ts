import { TopicRegistrationModule } from './app/modules/topic-registration/topic-registration.module';
import { TopicModule } from './app/modules/topic/topic.module';
import { MovementHistoryModule } from './app/modules/movement-history/movement-history.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { UserModule } from './app/modules/user/user.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from './app/core/middleware/logger.middleware';
import { IEntvironment } from './app/interfaces/environment.interface';

const ENV = process.env.MODE;

@Module({
  imports: [
    TopicRegistrationModule,
    TopicModule,
    MovementHistoryModule,
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      envFilePath: !ENV
        ? './src/environments/.env'
        : `./src/environments/.env.${ENV}`, //envioronment dosya pathini veriyorum
      isGlobal: true, // her yerde gecerli olmasini belirtiyorum
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule], // configModule kullanicam o yuzden import ediyorum,
      useFactory: (configService: ConfigService<IEntvironment>) => ({
        uri: configService.get<string>('MONGO_CONNECTION_STRING'),
        useCreateIndex: true,
        useFindAndModify: false,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})

//middleware in her requestte olmasini belirtiyorum
export class AppModule implements NestModule {
  //her istek once buraya girecek
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
