import { Param, UseGuards } from '@nestjs/common';
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from 'src/app/core/decorators/pagination.decorator';
import { Roles } from 'src/app/core/decorators/roles.decorator';
import { RoleType } from 'src/app/core/enums/role.enum';
import { ResponseHelper } from 'src/app/core/helpers/response.helper';
import { IPagination } from 'src/app/interfaces/pagination.interface';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Topic } from '../models/topic';
import { TopicService } from '../services/topic.service';

@Controller('topic')
export class TopicController {

    private controller = 'TopicController';
    private resHelper = new ResponseHelper();

    constructor(
        private readonly topicService : TopicService
    ) {}



    /********************************************************
	 @method POST
	 @url /topic/create
	 @params JWT
     @body Topic
	 @response topic
	********************************************************/
    @Post('create')
    @Roles(RoleType.Admin)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    async create(@Req() request,@Res() response, @Body() topic : Topic){

        const createdTopic = await this.topicService.create(topic)

        response.json(this.resHelper.set(
            200,
            createdTopic,
            {
                controller: this.controller,
                params :  request.params,
                headers : request.headers
            }
        ))
    }


    /********************************************************
	 @method GET
	 @url /topic
	 @params IPagination
	 @response topics
	********************************************************/
    @Get('fetch')
    async getAll(@Req() request, @Res() response, @Pagination() pagination : IPagination){

        const paginatedTopics = await this.topicService.findTopics(pagination);

        response.json(this.resHelper.set(
            200,
            paginatedTopics.data,
            {
                controller : this.controller,
                pagination : {
                    total : paginatedTopics.count,
                    ...pagination
                },
                params : request.params,
                headers : request.headers
            }
        ))

    }

    /********************************************************
	 @method POST
	 @url /topic/register
	 @params JWToken
	 @body {topicName}
	 @response topic-registration
	********************************************************/
    @Post('register')
    @UseGuards(AuthGuard('jwt'))
    async foo(@Res() response,@Req() request,@Body('topicName') topicName : string){

        const topicRegistration = await this.topicService.createTopicRegistration(topicName,request.user._id)

        response.json(this.resHelper.set(
            200,
            topicRegistration,
            {
                controller: this.controller,
                params :  request.params,
                headers : request.headers
            }
        ))

    }

    /********************************************************
	 @method POST
	 @url /topic/unregister
	 @params JWToken, , topicName
	 @response true
	********************************************************/
    @Post('unregister/:topicName')
    @UseGuards(AuthGuard('jwt'))
    async unregister(@Res() response,@Req() request,@Param('topicName') topicName:string){
        
        await this.topicService.deleteTopicRegistration(topicName,request.user._id)

        response.json(this.resHelper.set(
            200,
            true,
            {
                controller: this.controller,
                params :  request.params,
                headers : request.headers
            }
        ))

    }

    /********************************************************
	 @method GET
	 @url /topic
	 @params JWToken, IPagination
	 @response user's topic-registration
	********************************************************/
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getUsersTopic(@Res() response,@Req() request,@Pagination() pagination : IPagination){

        const topicOfUser = await this.topicService.getUserTopics(request.user._id,pagination)
        
        response.json(this.resHelper.set(
            200,
            topicOfUser,
            {
                controller: this.controller,
                params :  request.params,
                headers : request.headers
            }
        ))
    }

    /********************************************************
	 @method GET
	 @url /topic/:topicName
	 @params JWToken, topicName
	 @response topic e kaydolan kullanicilar
	********************************************************/
    @Get('/:topicName')
    @UseGuards(AuthGuard('jwt'))
    async getTopicUsers(@Res() response,@Req() request,@Param('topicName') topicName:string,@Pagination() pagination : IPagination){

        const userOfTopic =  await this.topicService.getTopicsUser(topicName,pagination)

        response.json(this.resHelper.set(
            200,
            userOfTopic,
            {
                controller: this.controller,
                params :  request.params,
                headers : request.headers
            }
        ))
    }

}
