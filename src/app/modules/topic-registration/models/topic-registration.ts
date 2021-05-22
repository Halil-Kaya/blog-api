import { Schema, Prop, SchemaFactory }        from '@nestjs/mongoose';
import { Document }                           from 'mongoose'
import * as mongoose from "mongoose";
import { User } from '../../user/models/user';
import { Topic } from '../../topic/models/topic';

@Schema()
export class TopicRegistration extends Document{

    @Prop({type:mongoose.Schema.Types.ObjectId,ref : Topic.name})
    topic : Topic | mongoose.Types.ObjectId

    @Prop({type:mongoose.Schema.Types.ObjectId,ref : User.name})
    user : User | mongoose.Types.ObjectId 
    
    @Prop({ type : Date,default: new Date(Date.now())})
    subscriptionDate?: Date;

}


export const TopicRegistrationSchema = SchemaFactory.createForClass(TopicRegistration)
