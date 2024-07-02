import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommandRecordService } from './command-record.service';
import { CreateCommandRecordDto } from './dto/create-command-record.dto';
import { UpdateCommandRecordDto } from './dto/update-command-record.dto';

@Controller('command-record')
export class CommandRecordController {
  constructor(private readonly commandRecordService: CommandRecordService) {}

  @Post()
  create(@Body() createCommandRecordDto: CreateCommandRecordDto) {
    return this.commandRecordService.create(createCommandRecordDto);
  }

  @Get()
  findAll() {
    return this.commandRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandRecordService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommandRecordDto: UpdateCommandRecordDto,
  ) {
    return this.commandRecordService.update(+id, updateCommandRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandRecordService.remove(+id);
  }
}
