import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('user', { schema: 'poker_test' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('char', { name: 'nickName', nullable: true, length: 25 })
  nickName: string | null;

  @Exclude()
  @Column('varchar', { name: 'password', nullable: true, length: 255 })
  password: string | null;

  @Column('char', { name: 'account', nullable: true, length: 25 })
  account: string | null;

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
