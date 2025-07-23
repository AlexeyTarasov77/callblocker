import { Column, Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "api_key" })
export class ApiKeyEntity {
  @Column({ primary: true })
  key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
