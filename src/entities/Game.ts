import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('game', { schema: 'poker_test' })
export class Game {
  constructor(partial: Partial<Game>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('text', { name: 'roomNumber', nullable: true })
  roomNumber: string | null;

  @Column('int', { name: 'status', nullable: true })
  status: number | null;

  @Column('text', { name: 'commonCard', nullable: true })
  commonCard: string | null;

  @Column('text', { name: 'winners', nullable: true })
  winners: string | null;

  @Column('int', { name: 'pot', nullable: true })
  pot: number | null;

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
