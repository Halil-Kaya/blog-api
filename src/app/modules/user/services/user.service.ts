import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { BaseError } from 'src/app/core/errors/base.error';
import { User, UserSchema } from '../models/user';
import * as $$       from 'lodash';
import { UserType } from '../enums/user-type.enum';
import { ErrorType } from 'src/app/core/enums/error-type.enum';
import * as bcrypt from 'bcrypt';
import { MovementHistoryService } from '../../movement-history/services/movement-history.service';
import { checkResult } from 'src/app/core/helpers/check-result';
import { MovementType } from '../../movement-history/enums/movement.enum';


@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private readonly userModel : Model<User>,
        private readonly movementHistoryService : MovementHistoryService
    ){}

    public async create(user:User) : Promise<User>{
        
        //eger boyle bir kullanici adina sahip user varsa error firlatiyor
        await this.checkUserNameUnique(user.userName) 
        
        //userType i kontrol ediyor tanimlanan userType disinda userType girmisse error firlatiyor
        this.isMatchingUserType(user.userType)

        //eger user tarihi kendisi girmisse onu siliyorum
        delete user.registeredAt;

        let newUser = new this.userModel(user);
        const createdUser = await newUser.save()

        //kullanici olusmus mu diye kontrol ediyorum
        checkResult<User>(createdUser,400,ErrorType.UNEXPECTED)

        //haraket gecmisini ekliyorum
        await this.addMovementHistoryToUser(createdUser._id,MovementType.USER_CREATED)

        return createdUser
    }

    public async findById(id:string) : Promise<User>{
        return await this.userModel
            .findById(Types.ObjectId(id))
    }

    public async findOne(query: FilterQuery<User>) : Promise<User>{
        return await this.userModel
            .findOne(query)
    }

    public async updateUserName(query : FilterQuery<User>,newUserName : string) : Promise<boolean>{

        if(!newUserName) throw new BaseError(400,ErrorType.NOT_VALID_USER_NAME)

        if(query._id){//string olarak gonderilen id yi object id ye donusturuyor
            query._id = Types.ObjectId(query._id);
        }

        const user = await this.findOne(query._id)
        
        //kullanici yoksa error firlatiyor
        if(!user) throw new BaseError(400,ErrorType.USER_NOT_FOUND)

        //guncelleyecegi userName alinmis mi diye kontrol ediyor
        //sorsunun anlami -> bu id ye sahip olmayan ama bu userName e sahip olan kisiyi getir
        const matchedUser = await this.userModel
                .findOne({_id: { $ne : query._id}, userName : newUserName})
        
        if(matchedUser){

            //haraket gecmisini ekliyorum
            await this.addMovementHistoryToUser(user._id,MovementType.FAIL_USERNAME_UPDATE)

            //kullanici adi alindigi icin error firlatiyorum
            throw new BaseError(400,ErrorType.THIS_USER_NAME_IS_TAKEN)

        } 

        user.userName = newUserName

        const updatedUser = await this.userModel
            .findOneAndUpdate(
                {...query},
                { ...user},
                { new : true }
            )
        
        
        checkResult<User>(updatedUser,400,ErrorType.UNEXPECTED)
        
        //haraket gecmisini ekliyorum
        await this.addMovementHistoryToUser(updatedUser._id,MovementType.SUCCESS_USERNAME_UPDATE)
            
        return true
    }

    public async updatePassword(query : FilterQuery<User>,oldPassword,newPassword) : Promise<boolean>{

        //yeni sifreyi kontrol ediyorum
        if(!newPassword) throw new BaseError(400,ErrorType.NOT_VALID_PASSWORD_TYPE)

        if(newPassword.length < 6) {
            throw new BaseError(400,ErrorType.SHORT_PASSWORD)
        }

        if(query._id){//string olarak gonderilen id yi object id ye donusturuyor
            query._id = Types.ObjectId(query._id);
        }

        const user = await this.findOne(query._id)

        //kullanici yoksa error firlatiyor
        if(!user) throw new BaseError(400,ErrorType.USER_NOT_FOUND)

        //kullanicinin sifresi yanlissa eror firlatiyorum
        if(!(await user.validatePassword(oldPassword))){

            //haraket gecmisini ekliyorum
            await this.addMovementHistoryToUser(user._id,MovementType.FAIL_PASSWORD_UPDATE)

            throw new BaseError(400,ErrorType.WRONG_PASSWORD)
        } 

        const hashedNewPassword = await this.hashGivenPassword(newPassword);

        user.password = hashedNewPassword;

        const updatedUser = await this.userModel
        .findOneAndUpdate(
            {...query},
            { ...user},
            { new : true }
        )

        checkResult<User>(updatedUser,400,ErrorType.UNEXPECTED)
        
        await this.addMovementHistoryToUser(updatedUser._id,MovementType.SUCCESS_PASSWORD_UPDATE)
        

        return true
    }


    public async updateUser(query : FilterQuery<User>, user:Partial<User>) : Promise<User>{

        if(query._id){//string olarak gonderilen id yi object id ye donusturuyor
            query._id = Types.ObjectId(query._id);
        }

        //boyle bir kullanici var mi diye kontrol ediyorum
        const realUser = await this.userModel.findById({_id : query._id})
        checkResult<User>(realUser,400,ErrorType.USER_NOT_FOUND)

        //kullanici adini, sifresini ve olusturulma tarihini guncellemesini engelliyor
        delete user.userName;
        delete user.password;
        delete user.registeredAt;

        //userType i kontrol ediyor tanimlanan userType ('standart','premium') disinda userType girmisse error firlatiyor
        if(!this.isMatchingUserType(user.userType)){

            await this.addMovementHistoryToUser(realUser._id,MovementType.FAIL_UPDATE)

            throw new BaseError(400,ErrorType.USER_TYPE_IS_NOT_A_VALID_VALUE)
        }

        const updatedUser  = await this.userModel
            .findOneAndUpdate(
                {...query },
                { ...user },
                { new : true }
            )

        checkResult<User>(updatedUser,400,ErrorType.UNEXPECTED)
        
        await this.addMovementHistoryToUser(updatedUser._id,MovementType.SUCCESSFUL_UPDATE)
                
        return updatedUser

    }   


    //kullanicinin haraket gecmisine olayi ekliyorum
    public async addMovementHistoryToUser(userId: string,movementType : MovementType){
        await this.movementHistoryService.create(userId,movementType)
    }

    //parametre olarak gonderilen userNameden zaten varsa error firlatiyor
    private async checkUserNameUnique(userName : string){
        let user = await this.userModel.findOne({userName: userName});
        if(user) throw new BaseError(400,ErrorType.THIS_USER_NAME_IS_TAKEN)
    }

    //parametre olarak gonderilen userType gecerli mi diye kontrol ediyor
    private isMatchingUserType(userType:string){

        //userType tanimli degilse guncellemek icin onu gondermemis demek bu yuzden bu islemi geciyorum
        if(!userType) return true;

        let matching = false

        for(let type in UserType){
            if(UserType[type] == userType){
        
                matching = true;
        
                break;
            }
        }

        return matching
    }

    private async hashGivenPassword(password : string) : Promise<string> {
        return await bcrypt.hash(password, 12);
    }


}
