import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "request_log" })
export class RequestLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ip: string;

  @CreateDateColumn()
  created_at: Date;

  // time elapsed during processing request in seconds
  @Column({ type: "float" })
  processing_time: number
}
