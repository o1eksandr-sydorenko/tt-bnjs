import { HttpException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

export interface IErrorProperty {
  name: string;
  messages: string[];
  key?: string | undefined;
}

export const getErrorProperties = (errors?: ValidationError[], key?: string): IErrorProperty[] => {
  const properties: IErrorProperty[] = [];
  errors?.forEach((error: ValidationError) => {
    if (!error.children?.length) {
      properties.push({
        name: error.property,
        key,
        messages: Object.values(error.constraints as Record<string, string>),
      });
    }
    properties.push(...getErrorProperties(error.children, (key ? `${key}.` : '') + error.property));
  });
  return properties;
};

export class ValidationException extends HttpException {
  properties: IErrorProperty[];
  constructor(errors: ValidationError[]) {
    const properties = getErrorProperties(errors);
    super(
      {
        error: 'ValidationException',
        message: 'Invalid values',
        properties,
      },
      422,
    );
    this.properties = properties;
  }
}
