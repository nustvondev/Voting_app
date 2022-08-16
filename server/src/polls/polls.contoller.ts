import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreatePollDto, JoinPollDto } from './dtos';

@Controller('polls')
export class PollsController {
    @Post()
    async create(@Body() createPollDto: CreatePollDto) {
        Logger.log('Create!');
        return createPollDto;
    }

    @Post('/join')
    async join(@Body() joinPollDto: JoinPollDto) {
        Logger.log('Join!');

        return joinPollDto;
    }

    @Post('/rejoin')
    async rejoin() {
        Logger.log('Rejoin!');
    }
}