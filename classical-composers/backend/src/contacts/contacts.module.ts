import { Module } from '@nestjs/common';
import { ContactsContrller } from './controller/contacts.controller';
import { ContactsService } from './service';

@Module({
  controllers: [ContactsContrller],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
