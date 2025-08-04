import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from 'typeorm';
import {User} from '../../users/entities/user.entity';

@Entity()
export class Chat{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    conversationId: string;

    @ManyToOne(() => User, (user) => user.chats)
    user: User;

    @Column('text')
    prompt: string;

    @Column('text')
    response: string;

    @CreateDateColumn()
    createdAt: Date;
}