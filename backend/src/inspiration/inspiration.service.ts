import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInspirationDto } from './dto/create-inspiration.dto';

@Injectable()
export class InspirationService {
  constructor(private prisma: PrismaService) {}

  findAll(workspaceId: string, userId: string) {
    return this.prisma.inspiration.findMany({
      where: { workspaceId, workspace: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateInspirationDto) {
    const ws = await this.prisma.workspace.findUnique({ where: { id: dto.workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');
    if (ws.userId !== userId) throw new ForbiddenException();
    return this.prisma.inspiration.create({ data: dto });
  }

  async remove(id: string, userId: string) {
    const inspiration = await this.prisma.inspiration.findFirst({
      where: { id, workspace: { userId } },
    });
    if (!inspiration) throw new NotFoundException('Inspiration not found');
    return this.prisma.inspiration.delete({ where: { id } });
  }
}
