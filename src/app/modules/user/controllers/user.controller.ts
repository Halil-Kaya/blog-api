import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ErrorType } from 'src/app/core/enums/error-type.enum';
import { checkResult } from 'src/app/core/helpers/check-result';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { UserType } from '../enums/user-type.enum';
import { User, UserSchema } from '../models/user';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {

    private controller = 'UserController';
    private resHelper = new ResponseHelper();

    constructor(
        private readonly userService : UserService
    ) {}


    @Post('update-password')
    async test2(@Body() data,@Res() response){


        return response.json(await this.userService.updatePassword({_id:data.id},data.password,data.newPassword))

    }

    @Post('update-userName')
    async test(@Body() data,@Res() response){


        return response.json(await this.userService.updateUserName({_id:data.id},data.userName))

    }

    @Get('test')
    foo(){


        for(let type in UserType){
            console.log(UserType[type])
            if(UserType[type] == UserType.Standart) break;

        }

        return "asd"

    }

    @Post('create')
    async create(@Req() request, @Res() response, @Body() user:User){

        const createdUser = await this.userService.create(user);
        checkResult<User>(createdUser,400,ErrorType.UNEXPECTED)

        response.json(this.resHelper.set(
            200,
            {
                controller : this.controller,
                params : request.params,
                headers : request.headers,
            }
        ))
    }


    @Post('update/:id')
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

    @Get('fetch')
    async getAll(@Req() request, @Res() response){

        const users = await this.userService.findAll();

        response.json(this.resHelper.set(
            200,
            users,
            {
                controller : this.controller,
                params : request.params,
                headers : request.headers
            }
        ))

    }


    @Get(':id')
    async getById(@Req() request, @Res() response, @Param('id') userId : any){

        const foundUser = await this.userService.findById(userId);

        checkResult<User>(foundUser,400,ErrorType.USER_NOT_FOUND);

        response.json(this.resHelper.set(
            200,
            foundUser,
            {
                controller : this.controller,
                params : request.params,
                headers : request.headers
            }
        ))

    }


}
