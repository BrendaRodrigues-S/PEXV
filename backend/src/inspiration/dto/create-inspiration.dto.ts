import { IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateInspirationDto {
  @IsUUID()
  workspaceId: string;

  @IsString()
  title: string;

  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
