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

  // phone number in an international format
  @Column({ unique: true })
  phone_number: string;

  // Phone number category
  @Column({ type: "enum", enum: PhoneStatus })
  status: PhoneStatus;

  // Short description
  @Column()
  description: string;

  // Information source
  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
