import { ValidationError, ValidationPipe } from '@nestjs/common';

export class MyValidatePipe extends ValidationPipe {
  protected mapChildrenToValidationErrors(
    error: ValidationError,
    parentPath?: string,
  ): ValidationError[] {
    const errors = super.mapChildrenToValidationErrors(error, parentPath);
    errors.forEach((item) => {
      for (let key in item.constraints) {
        item.constraints[key] = `${item.property}-${item.constraints[key]}`;
      }
    });
    return errors;
  }
}
