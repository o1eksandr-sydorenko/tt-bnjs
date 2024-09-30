import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContactsModule } from './contacts/contacts.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [process.env.NODE_ENV ? join(process.cwd(), `.env.${process.env.NODE_ENV || 'local'}`) : '', join(process.cwd(), '.env')],
    }),
    ContactsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
