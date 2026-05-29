import { Injectable } from '@nestjs/common';
import { LayoutType, WorkspaceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface TemplateConfig {
  boards: { title: string; layoutType: LayoutType; columns: string[] }[];
}

const TEMPLATES: Record<WorkspaceType, TemplateConfig> = {
  CREATIVE_ROUTINE: {
    boards: [
      {
        title: 'Rotina Semanal',
        layoutType: 'KANBAN',
        columns: ['Para Fazer', 'Em Foco', 'Bloqueado', 'Concluído'],
      },
      {
        title: 'Blocos de Energia',
        layoutType: 'CALENDAR',
        columns: ['Alta Energia', 'Energia Média', 'Repouso Criativo'],
      },
    ],
  },
  CLIENT_PROJECT: {
    boards: [
      {
        title: 'Pipeline do Projeto',
        layoutType: 'KANBAN',
        columns: ['Briefing', 'Pesquisa', 'Criação', 'Revisão', 'Entrega'],
      },
    ],
  },
  FULL_MANAGEMENT: {
    boards: [
      {
        title: 'Pipeline de Projetos',
        layoutType: 'KANBAN',
        columns: ['Briefing', 'Pesquisa', 'Criação', 'Revisão', 'Entrega'],
      },
      {
        title: 'Rotina Semanal',
        layoutType: 'KANBAN',
        columns: ['Para Fazer', 'Em Foco', 'Revisão', 'Concluído'],
      },
      {
        title: 'Agenda Criativa',
        layoutType: 'CALENDAR',
        columns: ['Manhã', 'Tarde', 'Noite'],
      },
    ],
  },
  CUSTOM: { boards: [] },
};

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return Object.entries(TEMPLATES).map(([type, config]) => ({
      type: type as WorkspaceType,
      boards: config.boards,
    }));
  }

  getByType(type: WorkspaceType) {
    return TEMPLATES[type] ?? TEMPLATES.CUSTOM;
  }

  async applyToWorkspace(workspaceId: string, type: WorkspaceType) {
    const config = TEMPLATES[type];
    if (!config.boards.length) return;

    for (let bi = 0; bi < config.boards.length; bi++) {
      const tpl = config.boards[bi]!;
      const board = await this.prisma.board.create({
        data: { workspaceId, title: tpl.title, layoutType: tpl.layoutType, position: bi },
      });

      for (let ci = 0; ci < tpl.columns.length; ci++) {
        await this.prisma.column.create({
          data: { boardId: board.id, title: tpl.columns[ci]!, position: ci },
        });
      }
    }
  }
}
