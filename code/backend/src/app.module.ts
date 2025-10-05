import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { Upload } from './entities/upload.entity';
import { Report } from './entities/report.entity';
import { UploadService } from './services/upload.service';
import { FieldMapperService } from './services/field-mapper.service';
import { ValidationService } from './services/validation.service';
import { ScoringService } from './services/scoring.service';
import { AnalyzerController } from './controllers/analyzer.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Upload, Report]),
  ],
  controllers: [AppController, AnalyzerController],
  providers: [
    AppService,
    UploadService,
    FieldMapperService,
    ValidationService,
    ScoringService,
  ],
})
export class AppModule {}
