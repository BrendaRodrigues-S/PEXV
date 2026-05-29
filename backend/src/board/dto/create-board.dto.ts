import { LayoutType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBoardDto {
  @IsUUID()
  workspaceId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsEnum(LayoutType)
  layoutType?: LayoutType;

  @IsOptional()
  @IsNumber()
  position?: number;
}
