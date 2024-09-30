import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ContactsService } from '../service';
import { ContactDto, CreateContactDto, UpdateContactDto } from '../dto';
import { PartialType } from '@nestjs/mapped-types';

@Controller('contacts')
export class ContactsContrller {
  constructor(protected readonly contactsService: ContactsService) {}

  @Get()
  async index(): Promise<ContactDto[]> {
    return this.contactsService.getAll();
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number): Promise<ContactDto> {
    return this.contactsService.getById(id);
  }

  @Post()
  async create(@Body() data: CreateContactDto): Promise<ContactDto> {
    return this.contactsService.create(data);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateContactDto): Promise<ContactDto> {
    return this.contactsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.contactsService.delete(id);
  }
}
