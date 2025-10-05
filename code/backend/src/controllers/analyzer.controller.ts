import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadDto, UploadResponseDto } from '../dto/upload.dto';
import { AnalyzeDto } from '../dto/analyze.dto';
import { ReportDto, ReportSummaryDto, HealthDto } from '../dto/report.dto';
import { Report } from '../entities/report.entity';
import { UploadService } from '../services/upload.service';
import { FieldMapperService } from '../services/field-mapper.service';
import { ValidationService } from '../services/validation.service';
import { ScoringService } from '../services/scoring.service';
import { v4 as uuidv4 } from 'uuid';
import { MulterFile } from '../types/invoice.types';

@Controller()
export class AnalyzerController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly fieldMapperService: FieldMapperService,
    private readonly validationService: ValidationService,
    private readonly scoringService: ScoringService,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDto,
  ): Promise<UploadResponseDto> {
    try {
      let uploadId: string;

      if (file) {
        // Handle file upload
        uploadId = await this.uploadService.processFile(
          file as MulterFile,
          uploadDto.country,
          uploadDto.erp,
        );
      } else if (uploadDto.text) {
        // Handle text/JSON upload
        uploadId = await this.uploadService.processText(
          uploadDto.text,
          uploadDto.country,
          uploadDto.erp,
        );
      } else {
        throw new BadRequestException('Either file or text must be provided');
      }

      return { uploadId };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Upload failed: ${errorMessage}`);
    }
  }

  @Post('analyze')
  async analyze(@Body() analyzeDto: AnalyzeDto): Promise<ReportDto> {
    try {
      // Get the upload
      const upload = await this.uploadService.getUpload(analyzeDto.uploadId);

      if (!upload || !upload.file_data) {
        throw new BadRequestException('Upload not found or has no data');
      }

      const data = upload.file_data;

      // Perform field mapping
      const coverage = this.fieldMapperService.mapFields(data);

      // Perform validation
      const { ruleFindings, gaps } = this.validationService.validateData(data);

      // Calculate total lines
      let linesTotal = 0;
      data.forEach((row) => {
        if (row.lines && Array.isArray(row.lines)) {
          linesTotal += row.lines.length;
        } else {
          linesTotal += 1; // Count the row itself as a line
        }
      });

      // Calculate scores
      const scores = this.scoringService.calculateScores(
        upload.rows_parsed,
        upload.rows_parsed, // We already limited to 200 rows
        coverage,
        ruleFindings,
        analyzeDto.questionnaire,
      );

      // Create report
      const reportId = `r_${uuidv4().split('-')[0]}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const reportDto: ReportDto = {
        reportId,
        scores,
        coverage,
        ruleFindings,
        gaps,
        meta: {
          rowsParsed: upload.rows_parsed,
          linesTotal,
          country: upload.country || undefined,
          erp: upload.erp || undefined,
          db: 'postgres',
        },
      };

      // Save report to database
      const report = this.reportRepository.create({
        id: reportId,
        upload_id: upload.id,
        scores_overall: scores.overall,
        report_json: reportDto,
        expires_at: expiresAt,
      });

      await this.reportRepository.save(report);

      return reportDto;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Analysis failed: ${errorMessage}`);
    }
  }

  @Get('report/:reportId')
  async getReport(@Param('reportId') reportId: string): Promise<ReportDto> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check if report has expired
    if (report.expires_at && new Date() > report.expires_at) {
      throw new NotFoundException('Report has expired');
    }

    return report.report_json;
  }

  @Get('reports')
  async getReports(): Promise<ReportSummaryDto[]> {
    const reports = await this.reportRepository.find({
      order: { created_at: 'DESC' },
      take: 10,
    });

    return reports.map((report) => ({
      id: report.id,
      uploadId: report.upload_id,
      createdAt: report.created_at,
      overallScore: report.scores_overall,
      expiresAt: report.expires_at,
    }));
  }

  @Get('health')
  async health(): Promise<HealthDto> {
    try {
      // Check database connection
      await this.reportRepository.query('SELECT 1');

      return {
        status: 'ok',
        database: {
          type: 'postgres',
          connected: true,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'error',
        database: {
          type: 'postgres',
          connected: false,
          error: errorMessage,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
