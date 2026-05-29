import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Get()
  findAll(@Query('workspaceId') workspaceId: string, @CurrentUser('id') userId: string) {
    return this.clientService.findAll(workspaceId, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateClientDto) {
    return this.clientService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.clientService.remove(id, userId);
  }
}
