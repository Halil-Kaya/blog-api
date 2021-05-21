import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy }         from 'passport-local';
import { ErrorType } from "src/app/core/enums/error-type.enum";
import { BaseError } from "src/app/core/errors/base.error";
import { AuthService } from "../services/auth.service";

@Injectable()
export class PassportLocalGuard extends PassportStrategy(Strategy,'local') {

    constructor(
        private readonly authService : AuthService
    ) { 
        super({
            usernameField : 'userName',
            passwordField : 'password',
            passReqToCallback : false
        });
    }

    async validate(username : string, password : string, done : Function) : Promise<any> {

        if(!username || !password){
            throw new BaseError(400,ErrorType.USER_NOT_FOUND)
        }

        return this.authService
            .signByCredentials(username,password)
            .then(signedUser => {

                if(signedUser){
                    done(null,signedUser.toObject());
                }else{
                    throw new BaseError(401,ErrorType.UNAUTHORIZED)
                }
            })
            .catch((err:Error) => {
            
                done(new BaseError(401,ErrorType.UNAUTHORIZED,err),null)
            
            })

    }

}