import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  findAll(@Query('boardId') boardId: string, @CurrentUser('id') userId: string) {
    return this.taskService.findAll(boardId, userId);
  }

  @Get('agenda')
  findAgenda(
    @Query('workspaceId') workspaceId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.findAgenda(workspaceId, userId, start, end);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.create(userId, dto);
  }

  @Patch('reorder')
  reorder(@CurrentUser('id') userId: string, @Body() dto: ReorderTasksDto) {
    return this.taskService.reorder(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.taskService.remove(id, userId);
  }
}
