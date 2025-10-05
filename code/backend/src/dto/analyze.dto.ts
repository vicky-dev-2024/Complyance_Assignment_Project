import { IsNotEmpty, IsString, IsObject, IsBoolean } from 'class-validator';

export class QuestionnaireDto {
  @IsBoolean()
  webhooks: boolean;

  @IsBoolean()
  sandbox_env: boolean;

  @IsBoolean()
  retries: boolean;
}

export class AnalyzeDto {
  @IsNotEmpty()
  @IsString()
  uploadId: string;

  @IsNotEmpty()
  @IsObject()
  questionnaire: QuestionnaireDto;
}
