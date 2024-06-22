import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('game', { schema: 'poker_test' })
export class Game {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'roomNumber', nullable: true })
  roomNumber: number | null;

  @Column('int', { name: 'status', nullable: true })
  status: number | null;

  @Column('text', { name: 'commonCard', nullable: true })
  commonCard: string | null;

  @Column('text', { name: 'winners', nullable: true })
  winners: string | null;

  @Column('decimal', { name: 'pot', nullable: true, precision: 8, scale: 0 })
  pot: string | null;

  @Column('timestamp', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;

  @Column('datetime', { name: 'update_time', nullable: true })
  updateTime: Date | null;
}
