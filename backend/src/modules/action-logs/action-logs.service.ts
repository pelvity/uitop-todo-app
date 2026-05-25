import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionLog } from './action-log.entity';

@Injectable()
export class ActionLogsService {
  constructor(
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
  ) {}

  async log(
    action: string,
    data: { todoId?: number; todoText: string; categoryName?: string; metadata?: string },
  ): Promise<ActionLog> {
    const logEntry = this.actionLogRepository.create({
      action,
      todoId: data.todoId ?? null,
      todoText: data.todoText,
      categoryName: data.categoryName ?? null,
      metadata: data.metadata ?? null,
    });
    return this.actionLogRepository.save(logEntry);
  }

  async findAll(limit: number = 50): Promise<ActionLog[]> {
    return this.actionLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
