import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { Chat } from '../chat/entities/chat.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findUserWithChats(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['chats'],
    });
  }

  async getRecentMessages(userId: string, limit = 5): Promise<{ prompt: string; response: string }[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['chats'],
      order: { chats: { createdAt: 'DESC' } },
    });

    return user?.chats?.slice(0, limit).map(chat => ({
      prompt: chat.prompt,
      response: chat.response,
    })) || [];
  }

  async saveChatHistory(userId: string, prompt: string, response: string): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) throw new Error('User not found');
    
    const chat = this.chatsRepository.create({ user, prompt, response });
    await this.chatsRepository.save(chat);
  }
}