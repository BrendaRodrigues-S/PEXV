import { LayoutType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(LayoutType)
  layoutType?: LayoutType;

  @IsOptional()
  @IsNumber()
  position?: number;
}
