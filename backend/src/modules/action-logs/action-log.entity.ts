import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('action_logs')
export class ActionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  action: string; // 'created' | 'completed' | 'uncompleted' | 'deleted' | 'restored'

  @Column({ type: 'integer', nullable: true })
  todoId: number | null;

  @Column({ type: 'varchar', length: 255 })
  todoText: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoryName: string | null;

  @Column({ type: 'text', nullable: true })
  metadata: string | null; // JSON string for extra info

  @CreateDateColumn()
  createdAt: Date;
}
