import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { ClientModule } from './client/client.module';
import { ColumnModule } from './column/column.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { InspirationModule } from './inspiration/inspiration.module';
import { PrismaModule } from './prisma/prisma.module';
import { TemplateModule } from './template/template.module';
import { TaskModule } from './task/task.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    BoardModule,
    ColumnModule,
    TaskModule,
    ClientModule,
    InspirationModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
