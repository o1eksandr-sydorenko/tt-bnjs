import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { NotFoundException } from '@nestjs/common';
import { ContactDto, CreateContactDto, UpdateContactDto } from '../dto';

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  resolve: jest.fn(() => '/mocked/path/contacts.json'),
}));

const mockContacts = [
  {
    id: 1064,
    email: 'benjamin.britten@aol.com',
    phone: '(737) 539-9955',
    address: {
      streetAddr: '64226 Goyette Passage',
      city: 'Imabury',
      stateCode: 'Connecticut',
      postalCode: '36165-6687',
    },
  },
  {
    id: 1065,
    email: 'hildegard.von.bingen@outlook.com',
    phone: '(922) 359-4839',
    address: {
      streetAddr: '370 W 14th Street',
      city: 'North Germanchester',
      stateCode: 'New York',
      postalCode: '28063-2381',
    },
  },
];

jest.mock('../../../storage/contacts.json', () => mockContacts, {
  virtual: true,
});

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsService],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
  });

  describe('getAll', () => {
    it('should return all contacts', async () => {
      const result = await service.getAll();
      expect(result).toEqual(mockContacts);
    });
  });

  describe('getById', () => {
    it('should return a contact by ID', async () => {
      const result = await service.getById(1064);
      expect(result).toEqual(mockContacts[0]);
    });

    it('should throw NotFoundException if contact not found', async () => {
      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLastId', () => {
    it('should return the highest ID', async () => {
      const result = await service.getLastId();
      expect(result).toEqual(1065);
    });

    it('should return null if no contacts exist', async () => {
      (service as any).contacts = [];
      const result = await service.getLastId();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const newContactDto: CreateContactDto = {
        email: 'new.contact@example.com',
        phone: '5555555555',
        address: {
          streetAddr: '789 Maple St',
          city: 'New City',
          stateCode: 'TX',
          postalCode: '67890',
        },
      };

      const expectedContact: ContactDto = {
        id: 1066,
        ...newContactDto,
      };

      jest.spyOn(service, 'getLastId').mockResolvedValue(1065);

      const result = await service.create(newContactDto);
      expect(result).toEqual(expectedContact);
      expect((service as any).contacts).toContainEqual(expectedContact);
    });
  });

  describe('update', () => {
    it('should update an existing contact', async () => {
      const updateContactDto: UpdateContactDto = {
        email: 'updated.email@example.com',
      };

      const result = await service.update(1064, updateContactDto);
      expect(result.email).toEqual(updateContactDto.email);
      expect(result.id).toEqual(1064);
    });

    it('should throw NotFoundException if contact not found', async () => {
      const updateContactDto: UpdateContactDto = {
        email: 'updated.email@example.com',
      };

      await expect(service.update(999, updateContactDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a contact', async () => {
      await service.delete(1064);
      expect((service as any).contacts.find((contact) => contact.id === 1064)).toBeUndefined();
    });

    it('should do nothing if contact not found', async () => {
      await expect(service.delete(999)).resolves.toBeUndefined();
    });
  });
});
