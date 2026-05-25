import { Controller, Get, Query } from '@nestjs/common';
import { ActionLogsService } from './action-logs.service';

@Controller('action-logs')
export class ActionLogsController {
  constructor(private readonly actionLogsService: ActionLogsService) {}

  @Get()
  async findAll(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.actionLogsService.findAll(parsedLimit);
  }
}
