import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Index('idx_user_id', ['userId'], {})
@Entity('player', { schema: 'poker_test' })
export class Player {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'gameId', nullable: true })
  gameId: number | null;

  @Column('int', { name: 'roomNumber', nullable: true })
  roomNumber: number | null;

  @Column('int', { name: 'buyIn' })
  buyIn: number;

  @Column('varchar', { name: 'handCard', nullable: true, length: 25 })
  handCard: string | null;

  @Column('int', { name: 'counter', nullable: true })
  counter: number | null;

  @Column('int', { name: 'userId', nullable: true })
  userId: number | null;

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
