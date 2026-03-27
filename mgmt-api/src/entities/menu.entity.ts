import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sys_menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  parent_id: number;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['MENU', 'BUTTON'] })
  type: string;

  @Column({ unique: true })
  permission_key: string;

  @Column({ nullable: true })
  api_path: string;

  @Column({ default: 0 })
  sort: number;

  @CreateDateColumn()
  created_at: Date;
}
