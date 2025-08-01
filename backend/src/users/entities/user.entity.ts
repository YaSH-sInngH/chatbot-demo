import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { Chat } from '../../chat/entities/chat.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(()=> Chat, (chat) => chat.user)
    chats: Chat[];

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}