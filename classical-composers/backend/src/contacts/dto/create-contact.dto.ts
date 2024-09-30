import { IsEmail, IsPhoneNumber, ValidateNested } from 'class-validator';
import { ContactAddressDto } from './contactj-address.dto';
import { Type } from 'class-transformer';

export class CreateContactDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @ValidateNested()
  @Type(() => ContactAddressDto)
  address: ContactAddressDto;
}
