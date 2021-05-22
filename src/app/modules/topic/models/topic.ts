import { Schema, Prop, SchemaFactory }        from '@nestjs/mongoose';
import { Document }                           from 'mongoose'
import { TopicRegistration } from '../../topic-registration/models/topic-registration';
import * as mongoose from "mongoose";


@Schema()
export class Topic extends Document{

    @Prop({type : String,required : true,unique : true,lowercase : true,trim : true})
    title : string;

    @Prop({type : String,required : true})
    description : string;

    @Prop({type : String,required : true})
    imagePath : string;

    @Prop({ type : Date,default: new Date(Date.now())})
    createdAt: Date;

}

export const TopicSchema = SchemaFactory.createForClass(Topic)
