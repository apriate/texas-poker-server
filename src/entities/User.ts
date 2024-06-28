import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
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
