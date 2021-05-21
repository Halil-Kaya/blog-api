import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'express';
import { ErrorType } from 'src/app/core/enums/error-type.enum';
import { checkResult } from 'src/app/core/helpers/check-result';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UserType } from '../enums/user-type.enum';
import { User, UserSchema } from '../models/user';
import { UserService } from '../services/user.service';
import * as $$       from 'lodash';
import { JwtHelper } from '../../auth/helpers/jwt.helper';


@Controller('user')
export class UserController {

    private controller = 'UserController';
    private resHelper = new ResponseHelper();

    constructor(
        private readonly userService : UserService,
        private readonly jwtHelper: JwtHelper
    ) {}


    /********************************************************
	 @method POST
	 @url /user/create
	 @body User
	 @response user & token
	********************************************************/
    @Post('create')
    async create(@Req() request, @Res() response, @Body() user:User){

        const createdUser = await this.userService.create(user);
        checkResult<User>(createdUser,400,ErrorType.UNEXPECTED)

        const token = this.jwtHelper.signSanitizedUser(createdUser);

        response.json(this.resHelper.set(
            200,
            {
                token,
                ...$$.pick(createdUser,[
                    '_id',
                    'userName',
                    'userType',
                    'registeredAt'
                ])
            },
            {
                controller : this.controller,
                params : request.params,
                headers : request.headers,
            }
        ))
    }


    /********************************************************
	 @method POST
	 @url /user/update-password
	 @params JWToken
	 @body UpdatePasswordDto
	 @response true-false & token
	********************************************************/
    @Post('update-password')
    @UseGuards(AuthGuard('jwt'))
    async updatePassword(@Res() response,@Req() request,@Body() updatePasswordDto : UpdatePasswordDto){

        const result = await this.userService.updatePassword( 
            {_id:request.user._id},
            updatePasswordDto.oldPassword,
            updatePasswordDto.newPassword
            )

        const token = this.jwtHelper.signSanitizedUser(request.user);

        return response
            .json(this.resHelper.set(
                200,
                {
                    token,
                    result
                },
                {
                    controller: this.controller,
                    params    : request.params,
                    headers   : request.headers
                }
            ))
    }

    /********************************************************
	 @method POST
	 @url /user/update-userName
	 @params JWToken
	 @body {newUserName}
	 @response true-false
	********************************************************/
    @Post('update-userName')
    @UseGuards(AuthGuard('jwt'))
    async test(@Res() response,@Req() request, @Body('newUserName') newUserName:string,){


        const result = await this.userService.updateUserName({_id:request.user._id},newUserName)

        return response
            .json(this.resHelper.set(
                200,
                result,
                {
                    controller: this.controller,
                    params    : request.params,
                    headers   : request.headers
                }
            ))

    }

    /********************************************************
	 @method POST
	 @url /user/update/:id
	 @params JWToken
	 @body User
	 @response updated user
	********************************************************/
    @Post('update/:id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Req() request,@Res() response,@Param('id') userId:string, @Body() user : User){

        const updatedUser = await this.userService.updateUser({_id:userId},user)

        checkResult<User>(updatedUser,400,ErrorType.USER_NOT_FOUND);//sonucu kontrol ediyor

        response.json(this.resHelper.set(
            200,
            updatedUser,
            {
                controller: this.controller,
                params :  request.params,
                headers : request.headers
            }
        ))
    }

    /********************************************************
	 @method GET
	 @url /user/update/:id
	 @params JWToken
	 @response updated user
	********************************************************/
    @Get(':id')
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
