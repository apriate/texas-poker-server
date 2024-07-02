import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Index('idx_game_id', ['gameId'], {})
@Index('idx_user_id', ['userId'], {})
@Entity('command_record', { schema: 'poker_test' })
export class CommandRecord {
  constructor(partial: Partial<CommandRecord>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId', nullable: true })
  userId: number | null;

  @Column('int', { name: 'gameId', nullable: true })
  gameId: number | null;

  @Column('text', { name: 'type', nullable: true })
  type: string | null;

  @Column('int', { name: 'gameStatus', nullable: true })
  gameStatus: number | null;

  @Column('int', { name: 'counter', nullable: true })
  counter: number | null;

  @Column('text', { name: 'command', nullable: true })
  command: string | null;

  @Column('text', { name: 'commonCard', nullable: true })
  commonCard: string | null;

  @Column('int', { name: 'pot', nullable: true })
  pot: number | null;

  @Column('int', { name: 'roomNumber', nullable: true })
  roomNumber: number | null;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'create_time',
    comment: '创建时间',
  })
  createTime: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'update_time',
    comment: '更新时间',
  })
  updateTime: Date;
}
