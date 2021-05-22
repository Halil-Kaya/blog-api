import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';
import { IEntvironment } from 'src/app/interfaces/environment.interface';
import { PassportJwtGuard } from './guards/passport-jwt.guard';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { JwtHelper } from './helpers/jwt.helper';

@Module({
  imports: [
    JwtModule.registerAsync({
        imports : [ConfigService],
        useFactory : async(configService : ConfigService<IEntvironment>) => ({
          secret : configService.get<string>('JWT_SECRET')
        }),
        inject : [ConfigService]
      }),
      UserModule
  ],
  controllers: [AuthController],
  providers: [
      AuthService,
      PassportJwtGuard,
      PassportLocalGuard,
      JwtHelper
    ],
    exports : [JwtHelper]
})
export class AuthModule {}
