import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClientDto {
  @IsUUID()
  workspaceId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
