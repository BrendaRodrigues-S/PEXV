import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateInspirationDto } from './dto/create-inspiration.dto';
import { InspirationService } from './inspiration.service';

@Controller('inspirations')
export class InspirationController {
  constructor(private inspirationService: InspirationService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId: string, @CurrentUser('id') userId: string) {
    return this.inspirationService.findAll(workspaceId, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateInspirationDto) {
    return this.inspirationService.create(userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.inspirationService.remove(id, userId);
  }
}
