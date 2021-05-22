import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IPagination, Paginated } from 'src/app/interfaces/pagination.interface';
import { TopicRegistration } from '../models/topic-registration';

@Injectable()
export class TopicRegistrationService {

    constructor(@InjectModel(TopicRegistration.name) private readonly topicRegistrationModel : Model<TopicRegistration>){}

    public async create(topicRegistration : TopicRegistration) : Promise<TopicRegistration> {
        
        //kullanici zaten kayitli mi diye kontrol ediyorum
        const foundedTopicRegistration = await this.topicRegistrationModel
            .findOne({topic : topicRegistration.topic,user : topicRegistration.user})

        //kullanici zaten kaydolmussa var olan kaydi donuyorum
        if(foundedTopicRegistration) return foundedTopicRegistration
        
        //kayit yoksa yeni kayit olusturuyorum
        let newTopicRegistration = new this.topicRegistrationModel(topicRegistration)
        return await newTopicRegistration.save()
    }

    public async findAll() : Promise<TopicRegistration[]>{
        return await this.topicRegistrationModel.find()
    }

    //topic e kayit olmus kullanicilari getiriyor
    public async getTopicsUser(topicId : string,paginate?: IPagination) : Promise<Paginated<TopicRegistration>>{

        const topicRegistrations = await this.topicRegistrationModel
            .find({topic : Types.ObjectId(topicId)},{__v : 0,topic : 0})
            .skip(paginate ? paginate.offset : 0)
            .limit(paginate ? paginate.limit : undefined)
            .populate('user',{password : 0,__v :0})
        
        return {
                count : topicRegistrations.length,
                data : topicRegistrations
            }
    
    }


    //kullanicinin kayit oldugu topicleri getiriyor
    public async getUserTopics(userId : string,paginate?: IPagination) : Promise<Paginated<TopicRegistration>>{
  
        const topicRegistrations = await this.topicRegistrationModel
            .find({user : Types.ObjectId(userId)},{user : 0,__v : 0})
            .skip(paginate ? paginate.offset : 0)
            .limit(paginate ? paginate.limit : undefined)
            .populate('topic',{__v : 0})

        return {
            count : topicRegistrations.length,
            data : topicRegistrations
        }
    }

    //topicId ve user Id ye gore topic-registration u siliyor
    public async deleteTopicRegistration(topicId : string, userId : string){
        return await this.topicRegistrationModel
            .deleteOne({topic : Types.ObjectId(topicId) ,user : Types.ObjectId(userId)})
    }


}
