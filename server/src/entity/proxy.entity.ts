import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProxyIP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column()
  port: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date

  @Column({ nullable: true })
  browserId: string;
}