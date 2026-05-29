import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';

class TaskPositionDto {
  @IsUUID()
  id: string;

  @IsNumber()
  position: number;
}

export class ReorderTasksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskPositionDto)
  tasks: TaskPositionDto[];
}
