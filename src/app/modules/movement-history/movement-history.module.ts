import { MovementHistoryController } from './controllers/movement-history.controller';
import { MovementHistoryService } from './services/movement-history.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementHistory, MovementHistorySchema } from './models/movement-history';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MovementHistory.name, schema: MovementHistorySchema }]),
  ],
  controllers: [MovementHistoryController],
  providers: [MovementHistoryService],
  exports : [MovementHistoryService]
})
export class MovementHistoryModule {}
