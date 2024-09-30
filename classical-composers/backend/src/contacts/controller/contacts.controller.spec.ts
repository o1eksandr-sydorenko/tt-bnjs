import { Test, TestingModule } from '@nestjs/testing';
import { ContactsContrller } from './contacts.controller';
import { ContactsService } from '../service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ContactsContrller],
      providers: [ContactsService],
    }).compile();
  });
});
