import { IsString } from 'class-validator';

export class ContactAddressDto {
  @IsString()
  streetAddr: string;

  @IsString()
  city: string;

  @IsString()
  stateCode: string;

  @IsString()
  postalCode: string;
}
