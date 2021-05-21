import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { UserService } from '../../user/services/user.service';
import { JwtHelper } from '../helpers/jwt.helper';
import * as $$       from 'lodash';


@Controller('auth')
export class AuthController {

    private controller = 'AuthController'
    private resHelper = new ResponseHelper()

    constructor(
        private readonly jwtHelper : JwtHelper,
        private readonly userService : UserService
    ){}

    @Post('login')
    @UseGuards(AuthGuard('local'))
    login(@Req() request, @Res() response){

        const token = this.jwtHelper.signSanitizedUser(request.user);

        response
            .json(this.resHelper.set(
                200,
                {
                    token,
                    ...request.user
                },
                {
                    controller : this.controller,
                    params : request.params,
                    headers : request.headers
                }
            ))

    }

    @Get('check')
    @UseGuards(AuthGuard('jwt'))
    checkAuth(@Req() request, @Res() response){
        
        const token = this.jwtHelper.signSanitizedUser(request.user);
        response.json(
            this.resHelper.set(
                200,
                {
                    token,
                    ...request.user
                }
            )
        )

    }

}
