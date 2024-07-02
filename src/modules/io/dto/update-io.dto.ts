import { PartialType } from '@nestjs/mapped-types';
import { CreateIoDto } from './create-io.dto';

export class UpdateIoDto extends PartialType(CreateIoDto) {
  id: number;
}
