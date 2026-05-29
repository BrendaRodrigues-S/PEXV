import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateColumnDto) {
    await this.assertBoardOwner(dto.boardId, userId);
    return this.prisma.column.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateColumnDto) {
    await this.assertColumnOwner(id, userId);
    return this.prisma.column.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertColumnOwner(id, userId);
    return this.prisma.column.delete({ where: { id } });
  }

  private async assertBoardOwner(boardId: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, workspace: { userId } },
    });
    if (!board) throw new NotFoundException('Board not found');
  }

  private async assertColumnOwner(columnId: string, userId: string) {
    const col = await this.prisma.column.findFirst({
      where: { id: columnId, board: { workspace: { userId } } },
    });
    if (!col) throw new NotFoundException('Column not found');
    return col;
  }
}
