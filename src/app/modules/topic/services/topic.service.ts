import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ErrorType } from 'src/app/core/enums/error-type.enum';
import { BaseError } from 'src/app/core/errors/base.error';
import { checkResult } from 'src/app/core/helpers/check-result';
import { IPagination, Paginated } from 'src/app/interfaces/pagination.interface';
import { MovementType } from '../../movement-history/enums/movement.enum';
import { MovementHistoryService } from '../../movement-history/services/movement-history.service';
import { TopicRegistration } from '../../topic-registration/models/topic-registration';
import { TopicRegistrationService } from '../../topic-registration/services/topic-registration.service';
import { Topic } from '../models/topic';

@Injectable()
export class TopicService {


    constructor(
        @InjectModel(Topic.name) private readonly topicModel : Model<Topic>,
        private readonly topicRegistrationService : TopicRegistrationService,
        private readonly movementHistoryService : MovementHistoryService,

    ){}

    async create(topic : Topic){
        return await this.topicModel.create(topic)
    }

    async findOne(query: FilterQuery<Topic>) : Promise<Topic>{
        return await this.topicModel.findOne(query)
    }

    //sayfalama yapacak sekilde butun topicleri getiriyor
    async findTopics(paginate?: IPagination, query?: FilterQuery<Topic>): Promise<Paginated<Topic>> {
        const count = await this.topicModel
            .countDocuments({
                ...query
            });

        const topics = await this.topicModel
            .find({
                ...query
            },
            {__v:0}
            )
            .skip(paginate ? paginate.offset : 0)
            .limit(paginate ? paginate.limit : undefined);

        return {
            count: count,
            data : topics
        };
    }

    //yeni bir topic kaydı olusturuyorum
    public async createTopicRegistration(topicName : string,userId : string){
        
        //boyle bir topic var mi diye kontrol ediyorum
        const topic = await this.findOne({title : topicName})
        
        if(!topic){
            await this.movementHistoryService.create(userId,MovementType.FAIL_TOPIC_REGISTRATION)
            throw new BaseError(400,ErrorType.TOPIC_NOT_FOUND)
        }

        const topicRegistration : any = {
            topic : topic._id,
            user : Types.ObjectId(userId)
        }

        //yeni bir topic registration olusturuyor
        const createdTopicRegistration = await this.topicRegistrationService.create(topicRegistration);

        //userin haraket gecmisine olayi ekliyorum
        if(createdTopicRegistration) {
            await this.movementHistoryService.create(userId,MovementType.SUCCESSFUL_TOPIC_REGISTRATION)
        }

        return createdTopicRegistration;
    }

    //topic registration u siliyorum yani kullanici unregister oluyor
    public async deleteTopicRegistration(topicName : string,userId : string){

        //boyle bir topic var mi diye kontrol ediyorum
        const topic = await this.findOne({title : topicName})

        if(!topic){
            await this.movementHistoryService.create(userId,MovementType.FAIL_TOPIC_CANCELLATION)
            throw new BaseError(400,ErrorType.TOPIC_NOT_FOUND)
        }

        //topic registrationu siliyorum
        await this.topicRegistrationService.deleteTopicRegistration(topic._id,userId);
        
        //userin haraket gecmisine olayi ekliyorum
        await this.movementHistoryService.create(userId,MovementType.SUCCESSFUL_TOPIC_CANCELLATION)

    }

    //kullanicinin kayit oldugu topicleri getiriyor
    public async getUserTopics(userId : string,paginate?: IPagination) : Promise<Paginated<TopicRegistration>>{
        return await this.topicRegistrationService.getUserTopics(userId,paginate)
    }

    //topic e kaydolan kullanicilari getiriyor
    public async getTopicsUser(topicName : string,paginate?: IPagination){
        const topic = await this.findOne({title : topicName.toLowerCase()})

        checkResult<Topic>(topic,400,ErrorType.TOPIC_NOT_FOUND)

        return await this.topicRegistrationService.getTopicsUser(topic._id,paginate);
    }

}
