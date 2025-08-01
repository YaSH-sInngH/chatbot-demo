import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: { userId: string; message: string }): Promise<{ success: boolean; response: string }> {
    try{
      const { userId, message } = body;
      if (!userId || !message) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }
      const response = await this.chatService.chat(userId, message);
      return { success: true, response };
    }catch(error){
      console.error('ChatController error:', error);
      throw new HttpException(
        error.message || 'Chat processing failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
