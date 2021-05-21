import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MovementType } from '../enums/movement.enum';
import * as mongoose from "mongoose";
import { User } from '../../user/models/user';

@Schema()
export class MovementHistory extends Document{

    @Prop({type : String, enum : MovementType,required : true})
    movementType : string;

    @Prop({type : Date,default: new Date(Date.now())})
    eventTime : Date;

    @Prop({type:mongoose.Schema.Types.ObjectId,ref : User.name})
    user : User | mongoose.Types.ObjectId
}

export const MovementHistorySchema = SchemaFactory.createForClass(MovementHistory)


