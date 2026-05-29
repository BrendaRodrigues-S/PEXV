import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  findAll(boardId: string, userId: string) {
    return this.prisma.task.findMany({
      where: { boardId, board: { workspace: { userId } } },
      include: { tags: { include: { tag: true } } },
      orderBy: { position: 'asc' },
    });
  }

  findAgenda(workspaceId: string, userId: string, start: string, end: string) {
    return this.prisma.task.findMany({
      where: {
        board: { workspaceId, workspace: { userId } },
        OR: [
          { startDate: { gte: new Date(start), lte: new Date(end) } },
          { deadline: { gte: new Date(start), lte: new Date(end) } },
        ],
      },
      include: { tags: { include: { tag: true } } },
      orderBy: [{ startDate: 'asc' }, { deadline: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    await this.assertBoardOwner(dto.boardId, userId);
    return this.prisma.task.create({
      data: dto,
      include: { tags: { include: { tag: true } } },
    });
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    await this.assertTaskOwner(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: dto,
      include: { tags: { include: { tag: true } } },
    });
  }

  async reorder(userId: string, dto: ReorderTasksDto) {
    const updates = dto.tasks.map(({ id, position }) =>
      this.prisma.task.updateMany({
        where: { id, board: { workspace: { userId } } },
        data: { position },
      }),
    );
    await this.prisma.$transaction(updates);
    return { success: true };
  }

  async remove(id: string, userId: string) {
    await this.assertTaskOwner(id, userId);
    return this.prisma.task.delete({ where: { id } });
  }

  private async assertBoardOwner(boardId: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, workspace: { userId } },
    });
    if (!board) throw new NotFoundException('Board not found');
  }

  private async assertTaskOwner(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, board: { workspace: { userId } } },
    });
    if (!task) throw new NotFoundException('Task not found');
  }
}
