import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { OutreachService } from './outreach.service';
import { OutreachDto } from './outreach.dto';

@Controller('outreach')
export class OutreachController {
    constructor(private readonly outreachService: OutreachService) {}

    @Post()
    async create(@Body() outreachDto: OutreachDto): Promise<OutreachDto> {
        return this.outreachService.add(outreachDto);
    }

    @Get()
    async findAll(): Promise<OutreachDto[]> {
        return this.outreachService.findAll();
    }

    @Get('user/:userId')
    async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<OutreachDto[]> {
        return this.outreachService.findByUserId(userId);
    }
}
