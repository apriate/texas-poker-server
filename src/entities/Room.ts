import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('room', { schema: 'poker_test' })
export class Room {
  constructor(partial: Partial<Room>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'smallBlind', nullable: true })
  smallBlind: number | null;

  @Column('tinyint', { name: 'isShort', nullable: true, width: 1 })
  isShort: boolean | null;

  @Column('int', { name: 'time', nullable: true })
  time: number | null;

  @Column('text', { name: 'roomNumber', nullable: true })
  roomNumber: string | null;

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
