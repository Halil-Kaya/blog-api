import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { response } from 'express';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { MovementHistoryService } from '../services/movement-history.service';
import * as $$       from 'lodash';
import { UserMovementHistoryDto } from '../dto/user-movement.dto';

@Controller('movement-history')
export class MovementHistoryController {

    private controller = 'MovementHistoryController';
    private resHelper = new ResponseHelper();

    constructor(
        private readonly movementHistoryService : MovementHistoryService
    ) {}

    /********************************************************
	 @method GET
	 @url /movement-history
	 @params JWToken
	 @response user and user's movement history
	********************************************************/
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getByUserId(@Res() response,@Req() request){

        const result =  await this.movementHistoryService.getMovementHistoryOfUser(request.user._id)
        
        let userMovementHistoryDto = new UserMovementHistoryDto()

        userMovementHistoryDto.user = $$.pick(request.user,[
            '_id',
            'userName',
            'userType',
            'registeredAt'
        ])

        userMovementHistoryDto.usersMovementHistory = result;

        response.json(this.resHelper.set(
            200,
            {
                ...userMovementHistoryDto
            },
            {
                controller : this.controller,
                params : request.params,
                headers : request.headers
            }
        ))

    }


}
