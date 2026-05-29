import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateColumnDto {
  @IsUUID()
  boardId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
