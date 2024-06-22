import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('room', { schema: 'poker_test' })
export class Room {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'smallBlind', nullable: true })
  smallBlind: number | null;

  @Column('int', { name: 'isShort', nullable: true })
  isShort: number | null;

  @Column('int', { name: 'time', nullable: true })
  time: number | null;

  @Column('text', { name: 'roomNumber', nullable: true })
  roomNumber: string | null;

  @Column('timestamp', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;

  @Column('datetime', { name: 'update_time', nullable: true })
  updateTime: Date | null;
}
