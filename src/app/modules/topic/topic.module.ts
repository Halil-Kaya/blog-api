import { TopicService } from './services/topic.service';
import { TopicController } from './controller/topic.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './models/topic';
import { TopicRegistrationModule } from '../topic-registration/topic-registration.module';
import { MovementHistoryModule } from '../movement-history/movement-history.module';

@Module({
  imports: [
    
    MongooseModule.forFeature([
        {name : Topic.name, schema : TopicSchema}
    ]),
    TopicRegistrationModule,
    MovementHistoryModule
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
