import { ContactAddressDto } from './contactj-address.dto';

export class ContactDto {
  id: number;
  email: string;
  phone: string;
  address: ContactAddressDto;
}
