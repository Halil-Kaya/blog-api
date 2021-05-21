import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ErrorType } from 'src/app/core/enums/error-type.enum';
import { checkResult } from 'src/app/core/helpers/check-result';
import { ISanitizedUser } from '../../user/interfaces/sanitized-user.interface';
import { User } from '../../user/models/user';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class AuthService {

    constructor(private readonly userService : UserService){}

    async signByJwt(sanitizedUser : ISanitizedUser) : Promise<User> {
        return this.userService.findOne({_id : Types.ObjectId(sanitizedUser._id)})
    }

    async signByCredentials(userName : string,password : string) : Promise<User>{

        const user = await this.userService.findOne({userName : userName})
        checkResult<User>(user,400,ErrorType.USER_NOT_FOUND)

        const isValid = await user.validatePassword(password);
        checkResult<boolean>(isValid,400,ErrorType.WRONG_PASSWORD)
        
        return user;
    }

}
