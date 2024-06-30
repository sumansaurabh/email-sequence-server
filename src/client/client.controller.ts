import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientDto } from './client.dto';
import { TransformClassMethods } from 'src/utils/transform-class.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roels.guard';
import { UserRole } from 'src/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Request() req, @Body() clientDto: ClientDto): Promise<ClientDto> {
        clientDto.userId = req.user.id;
        const client = await this.clientService.add(clientDto);
        return client;
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async findAll(): Promise<ClientDto[]> {
        const clients = await this.clientService.findAll();
        return clients;
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUser(@Request() req): Promise<ClientDto[]> {
        const userId = req.user.id;
        const clients = await this.clientService.findByUserId(userId);
        return clients;
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<void> {
        const userId = req.user.id;
        return this.clientService.delete(id, userId);
    }
}
