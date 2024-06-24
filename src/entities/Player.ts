import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
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
  @Column('timestamp', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;

  @Exclude()
  @Column('datetime', { name: 'update_time', nullable: true })
  updateTime: Date | null;
}
