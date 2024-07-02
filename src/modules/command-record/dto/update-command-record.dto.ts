import { PartialType } from '@nestjs/swagger';
import { CreateCommandRecordDto } from './create-command-record.dto';

export class UpdateCommandRecordDto extends PartialType(
  CreateCommandRecordDto,
) {}
