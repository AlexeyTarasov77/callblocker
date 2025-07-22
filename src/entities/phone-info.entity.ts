import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PhoneStatus {
  SAFE = "safe",
  SPAM = "spam",
  SCAM = "scam",
  UNKNOWN = "unknown"
}

@Entity({ name: "phone_info" })
export class PhoneInfoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ type: "enum", enum: PhoneStatus })
  status: PhoneStatus;

  @Column()
  description: string;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
