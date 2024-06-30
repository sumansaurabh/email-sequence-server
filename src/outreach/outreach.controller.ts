import { Controller, Get, Request, Post, Body, Param, ParseIntPipe, UseGuards, BadRequestException, Put } from '@nestjs/common';
import { OutreachService } from './outreach.service';
import { OutreachDto } from './outreach.dto';
import { Unique } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roels.guard';
import { UserRole } from 'src/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('outreach')
@Unique(['name', 'userId'])  // Composite unique constraint
export class OutreachController {
    constructor(private readonly outreachService: OutreachService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Request() req, @Body() outreachDto: OutreachDto): Promise<OutreachDto> {
        outreachDto.userId = req.user.id;
        return this.outreachService.add(outreachDto);
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    async put(@Request() req, @Body() outreachDto: OutreachDto): Promise<OutreachDto> {
        outreachDto.userId = req.user.id;
        return this.outreachService.add(outreachDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async findAll(): Promise<OutreachDto[]> {
        return this.outreachService.findAll();
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUserId(@Request() req): Promise<OutreachDto[]> {
        const userId = req.user.id;
        return this.outreachService.findByUserId(userId);
    }
}
