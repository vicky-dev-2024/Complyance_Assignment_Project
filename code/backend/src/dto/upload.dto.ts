import { IsOptional, IsString } from 'class-validator';

export class UploadDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  erp?: string;
}

export class UploadResponseDto {
  uploadId: string;
}
