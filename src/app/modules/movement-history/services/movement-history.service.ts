import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { MovementType } from '../enums/movement.enum';
import { MovementHistory } from '../models/movement-history';

@Injectable()
export class MovementHistoryService {

    constructor(@InjectModel(MovementHistory.name) private readonly movementHistoryModel : Model<MovementHistory>){}

    public async create(userId:string ,movementType : MovementType) : Promise<MovementHistory> {
        let movement = new this.movementHistoryModel({user : userId,movementType : movementType})
        return await movement.save()
    }

    public async findAll() : Promise<MovementHistory[]>{
        return await this.movementHistoryModel.find()
    }

    public async findById(id:string) : Promise<MovementHistory>{
        return await this.movementHistoryModel
            .findById(Types.ObjectId(id))
    }

    public async findOne(query: FilterQuery<MovementHistory>) : Promise<MovementHistory>{
        return await this.movementHistoryModel
            .findOne(query)
    }

    public async findAllByUserId(userId : string) : Promise<MovementHistory[]>{
        return await this.movementHistoryModel.find({user : Types.ObjectId(userId)},{__v : 0 } )
    }

}
