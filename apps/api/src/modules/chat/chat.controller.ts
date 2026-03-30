import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({
    summary: 'Send a message to the AI procurement assistant',
    description:
      'Chat with the ProcGenie AI assistant about procurement policies, processes, and best practices.',
  })
  @ApiResponse({ status: 200, description: 'AI response' })
  async sendMessage(
    @Body() body: { message: string; history?: { role: string; content: string }[] },
  ) {
    return this.chatService.chat(body.message, body.history);
  }
}
