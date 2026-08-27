import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { TestChatService } from './test-chat.service';
import { AskDto } from './dto/ask.dto';
import { SaveCorrectionDto } from './dto/save-correction.dto';

@ApiTags('test-chat')
@Controller('test-chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestChatController {
  constructor(private testChatService: TestChatService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Probar cómo respondería el AI Coach con el conocimiento ya aprobado' })
  ask(@Body() dto: AskDto) {
    return this.testChatService.ask(dto);
  }

  @Post('save')
  @ApiOperation({ summary: 'Aprobar o corregir la respuesta y guardarla como entrada de entrenamiento' })
  save(@Body() dto: SaveCorrectionDto, @GetUser('id') trainerId: string) {
    return this.testChatService.saveCorrection(dto, trainerId);
  }
}
