import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  findAll(workspaceId: string, userId: string) {
    return this.prisma.client.findMany({
      where: { workspaceId, workspace: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateClientDto) {
    await this.assertWorkspaceOwner(dto.workspaceId, userId);
    return this.prisma.client.create({ data: dto });
  }

  async update(id: string, userId: string, dto: UpdateClientDto) {
    await this.assertClientOwner(id, userId);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertClientOwner(id, userId);
    return this.prisma.client.delete({ where: { id } });
  }

  private async assertWorkspaceOwner(workspaceId: string, userId: string) {
    const ws = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');
    if (ws.userId !== userId) throw new ForbiddenException();
  }

  private async assertClientOwner(clientId: string, userId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, workspace: { userId } },
    });
    if (!client) throw new NotFoundException('Client not found');
  }
}
