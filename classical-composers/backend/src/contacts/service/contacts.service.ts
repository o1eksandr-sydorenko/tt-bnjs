import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactAddressDto, ContactDto, CreateContactDto, UpdateContactDto } from '../dto';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class ContactsService {
  private readonly filePath = resolve(__dirname, '../../../storage/contacts.json');

  async getAll(): Promise<ContactDto[]> {
    return this.read();
  }

  async getById(id: number): Promise<ContactDto> {
    const contacts = await this.read();
    const contact = contacts.find((contact) => contact.id == id);

    if (!contact) {
      throw new NotFoundException();
    }

    return contact;
  }

  async getLastId(): Promise<number | null> {
    return (await this.read()).sort((first, second) => first.id - second.id).at(-1)?.id;
  }

  async create({ email, phone, address }: CreateContactDto): Promise<ContactDto> {
    const contacts = await this.read();
    const contact: ContactDto = {
      id: (await this.getLastId()) + 1,
      email,
      phone,
      address,
    };
    contacts.push(contact);

    await this.save(contacts);

    return contact;
  }

  async update(id: number, data: UpdateContactDto): Promise<ContactDto> {
    const contacts = await this.read();
    const contactIndex = contacts.findIndex((contact) => contact.id == id);

    if (contactIndex === -1) {
      throw new NotFoundException();
    }

    contacts[contactIndex] = {
      ...contacts[contactIndex],
      ...data,
    };

    await this.save(contacts);

    return contacts[contactIndex];
  }

  async delete(id: number): Promise<void> {
    const contacts = await this.read();
    const contactIndex = contacts.findIndex((contact) => contact.id == id);

    if (contactIndex === -1) {
      return;
    }

    delete contacts[contactIndex];

    await this.save(contacts);
  }

  async save(contacts: ContactDto[]): Promise<void> {
    writeFileSync(this.filePath, JSON.stringify(contacts, null, 2));
  }

  async read(): Promise<ContactDto[]> {
    return JSON.parse(readFileSync(this.filePath, 'utf-8'));
  }
}
