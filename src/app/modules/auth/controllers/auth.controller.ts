import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { UserService } from '../../user/services/user.service';
import { JwtHelper } from '../helpers/jwt.helper';
import * as $$       from 'lodash';
import { checkResult } from 'src/app/core/helpers/check-result';
import { User } from '../../user/models/user';
import { ErrorType } from 'src/app/core/enums/error-type.enum';
import { UpdatePasswordDto } from '../dtos/update-password.dto';


@Controller('auth')
export class AuthController {

    private controller = 'AuthController'
    private resHelper = new ResponseHelper()

    constructor(
        private readonly jwtHelper : JwtHelper,
        private readonly userService : UserService
    ){}

    /********************************************************
	 @method GET
	 @url /auth/login
	 @body {userName,password}
	 @response user & token
	********************************************************/
    @Post('login')
    @UseGuards(AuthGuard('local'))
    login(@Req() request, @Res() response){

        const token = this.jwtHelper.signSanitizedUser(request.user);

        response
            .json(this.resHelper.set(
                200,
                {
                    token,
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

    /********************************************************
	 @method GET
	 @url /auth/check
	 @params JWToken
	 @response token
	********************************************************/
    @Get('check')
    @UseGuards(AuthGuard('jwt'))
    checkAuth(@Req() request, @Res() response){
        
        const token = this.jwtHelper.signSanitizedUser(request.user);
        response.json(
            this.resHelper.set(
                200,
                {
                    token
                }
            )
        )
    }


    /********************************************************
	 @method POST
	 @url /auth/create
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
	 @url /auth/update-password
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
	 @url /auth/update-userName
	 @params JWToken
	 @body {newUserName}
	 @response true-false
	********************************************************/
    @Post('update-userName')
    @UseGuards(AuthGuard('jwt'))
    async test(@Res() response,@Req() request, @Body('newUserName') newUserName:string,){


        const result = await this.userService.updateUserName({_id:request.user._id},newUserName)

        //username guncellendi tokenin icinde de username var o yuzden kullaniciyi bir daha cagrip yeni token veriyorum 
        const user = await this.userService.findOne({_id:request.user._id})

        const token = this.jwtHelper.signSanitizedUser(user);


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

}
