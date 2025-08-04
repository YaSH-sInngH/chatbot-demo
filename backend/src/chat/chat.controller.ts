import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, Get, Req, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async chat(@Body() body: { userId: string; message: string; conversationId?: string }): Promise<{ success: boolean; response: string }> {
    try {
      const { userId, message, conversationId } = body;
      if (!userId || !message) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      const response = await this.chatService.chat(userId, message, conversationId);
      return { success: true, response };
    } catch (error) {
      console.error('ChatController error:', error);
      throw new HttpException(
        error.message || 'Chat processing failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  async history(@Req() req, @Query('conversationId') conversationId?: string): Promise<{ chats: { prompt: string; response: string }[] }> {
    // JwtStrategy attaches "userId" to req.user (payload.sub)
    const userId = req.user?.userId;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const chats = await this.usersService.getRecentMessages(userId, conversationId, 50);
    return { chats };
  }
}