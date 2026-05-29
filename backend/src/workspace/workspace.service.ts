import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { WorkspaceStatus, WorkspaceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateService } from '../template/template.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private prisma: PrismaService,
    private templateService: TemplateService,
  ) {}

  findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: { userId, status: { not: WorkspaceStatus.ARCHIVED } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id, userId },
      include: { boards: { include: { columns: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } }, clients: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: {
        ...dto,
        userId,
        status: dto.workspaceType === WorkspaceType.CUSTOM ? 'DRAFT' : 'ACTIVE',
      },
    });

    // Auto-apply template unless CUSTOM
    if (dto.workspaceType && dto.workspaceType !== WorkspaceType.CUSTOM) {
      await this.templateService.applyToWorkspace(workspace.id, dto.workspaceType);
    }

    return this.findOne(workspace.id, userId);
  }

  async update(id: string, userId: string, dto: UpdateWorkspaceDto) {
    await this.assertOwner(id, userId);
    return this.prisma.workspace.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);
    return this.prisma.workspace.delete({ where: { id } });
  }

  private async assertOwner(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.userId !== userId) throw new ForbiddenException();
  }
}
