import { TopicRegistrationService } from './services/topic-registration.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicRegistration, TopicRegistrationSchema } from './models/topic-registration';

@Module({
  imports: [

    MongooseModule.forFeature([
        {name : TopicRegistration.name, schema : TopicRegistrationSchema}
    ])

  ],
  controllers: [],
  providers: [TopicRegistrationService],
  exports : [TopicRegistrationService]
})
export class TopicRegistrationModule {}
