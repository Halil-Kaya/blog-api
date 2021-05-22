import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'express';
import { ErrorType } from 'src/app/core/enums/error-type.enum';
import { checkResult } from 'src/app/core/helpers/check-result';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { UserType } from '../enums/user-type.enum';
import { User, UserSchema } from '../models/user';
import { UserService } from '../services/user.service';
import * as $$       from 'lodash';


@Controller('user')
export class UserController {

    private controller = 'UserController';
    private resHelper = new ResponseHelper();

    constructor(
        private readonly userService : UserService
    ) {}

    /********************************************************
	 @method POST
	 @url /user/update/:id
	 @params JWToken
	 @body User
	 @response updated user
	********************************************************/
    @Post('update')
    @UseGuards(AuthGuard('jwt'))
    async update(@Req() request,@Res() response, @Body() user : User){

        const updatedUser = await this.userService.updateUser({_id:request.user._id},user)

        checkResult<User>(updatedUser,400,ErrorType.USER_NOT_FOUND);//sonucu kontrol ediyor

        response.json(this.resHelper.set(
            200,
            {
                ...$$.pick(updatedUser,[
                    '_id',
                    'userName',
                    'userType',
                    'registeredAt'
                ])
            },
            {
                controller: this.controller,
                params :  request.params,
                headers : request.headers
            }
        ))
    }

    /********************************************************
	 @method GET
	 @url /user/profile
	 @params JWToken
	 @response user
	********************************************************/
    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getById(@Req() request, @Res() response){


        checkResult<User>(request.user,400,ErrorType.USER_NOT_FOUND);

        response.json(this.resHelper.set(
            200,
            {
                ...$$.pick(request.user,[
                    '_id',
                    'userName',
                    'userType',
                    'registeredAt'
                ])
            },
            {
                controller : this.controller,
                params : request.params,
                headers : request.headers
            }
        ))
    }


}
