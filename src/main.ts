import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './app/core/filters/all-exception.filter';
import { LogHelper } from './app/core/helpers/logger.helper';



async function bootstrap() {

  const logHelper = new LogHelper()


  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin : '*'
  })

  const config = app.get(ConfigService)

  //butun exceptionlari ele aliyorum
  app.useGlobalFilters(new AllExceptionsFilter())
  
  //endpointlerin /api ile baslayacagini belirtiyorum
  await app.setGlobalPrefix(config.get<string>('URL_ROOT'))

  //environment dosyasindan portu getiriyorum
  await app.listen(config.get<number>('PORT'))
  
  console.log(`Server is up on ${ await app.getUrl() } `);

  //serverin baslatildigini logluyorum
  logHelper.logTrace(`Server is up on ${ config.get<number>('PORT') } port`)


}
bootstrap()
.catch(err => {//serverda bir hata olursa ekrana bastiriyorum
  
  console.log(err.message)

});
