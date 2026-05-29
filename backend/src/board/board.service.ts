import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  findAll(workspaceId: string, userId: string) {
    return this.prisma.board.findMany({
      where: { workspaceId, workspace: { userId } },
      include: { columns: { orderBy: { position: 'asc' } } },
      orderBy: { position: 'asc' },
    });
  }

  async create(userId: string, dto: CreateBoardDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);
    return this.prisma.board.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateBoardDto) {
    await this.assertBoardOwner(id, userId);
    return this.prisma.board.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertBoardOwner(id, userId);
    return this.prisma.board.delete({ where: { id } });
  }

  private async assertWorkspaceOwner(workspaceId: string, userId: string) {
    const ws = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');
    if (ws.userId !== userId) throw new ForbiddenException();
  }

  private async assertBoardOwner(boardId: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, workspace: { userId } },
    });
    if (!board) throw new NotFoundException('Board not found');
  }
}
