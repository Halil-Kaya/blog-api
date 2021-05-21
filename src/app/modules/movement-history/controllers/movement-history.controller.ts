import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { response } from 'express';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { MovementHistoryService } from '../services/movement-history.service';

@Controller('movement-history')
export class MovementHistoryController {

    private controller = 'MovementHistoryController';
    private resHelper = new ResponseHelper();

    constructor(
        private readonly movementHistoryService : MovementHistoryService
    ) {}


    @Post('create')
    async create(@Res() response,@Body() data){

        response.json(await this.movementHistoryService.create(data.id,data.type))
    }


    @Get('fetch')
    async fetch(@Res() response){

        response.json(await this.movementHistoryService.findAll())
    }

    @Get(':id')
    async getByUserId(@Res() response,@Param('id') id){

        response.json(await this.movementHistoryService.findAllByUserId(id))

    }

}
