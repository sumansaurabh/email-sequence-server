import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entity/client.entity';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ClientDto } from './client.dto';
import { TransformClassMethods } from 'src/utils/transform-class.decorator';

@Injectable()
@TransformClassMethods(ClientDto)
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async add(clientDto: ClientDto): Promise<Client> {
    const client = plainToClass(Client, clientDto);
    const errors = await validate(client);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return await this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find();
  }

  async findById(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id: id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async findByUserId(userId: number): Promise<Client[]> {
    const clientList = await this.clientRepository.find({ where: { userId: userId } });
    return clientList;
  }

  async delete(id: number, userId): Promise<void> {
    const client = await this.findById(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (client.userId !== userId) {
      throw new BadRequestException('You are not authorized to delete this client');
    }
    await this.clientRepository.delete(id);
  }
}
