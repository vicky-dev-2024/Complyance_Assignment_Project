import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../entities/upload.entity';
import { v4 as uuidv4 } from 'uuid';
import * as Papa from 'papaparse';
import { InvoiceData, InvoiceRow, MulterFile } from '../types/invoice.types';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private uploadRepository: Repository<Upload>,
  ) {}

  async processFile(
    file: MulterFile,
    country?: string,
    erp?: string,
  ): Promise<string> {
    const fileType = this.detectFileType(file);
    let parsedData: InvoiceData;

    if (fileType === 'json') {
      parsedData = this.parseJSON(file.buffer.toString('utf-8'));
    } else if (fileType === 'csv') {
      parsedData = await this.parseCSV(file.buffer.toString('utf-8'));
    } else {
      throw new BadRequestException('Unsupported file type');
    }

    // Limit to 200 rows
    const limitedData = parsedData.slice(0, 200);

    const uploadId = `u_${uuidv4().split('-')[0]}`;
    const upload = new Upload();
    upload.id = uploadId;
    upload.country = country || null;
    upload.erp = erp || null;
    upload.rows_parsed = limitedData.length;
    upload.file_data = limitedData;
    upload.file_type = fileType;

    await this.uploadRepository.save(upload);
    return uploadId;
  }

  async processText(
    text: string,
    country?: string,
    erp?: string,
  ): Promise<string> {
    const trimmedText = text.trim();
    let parsedData: InvoiceData;
    let fileType: string;

    // Try to detect if it's JSON or CSV
    if (trimmedText.startsWith('[') || trimmedText.startsWith('{')) {
      parsedData = this.parseJSON(trimmedText);
      fileType = 'json';
    } else {
      parsedData = await this.parseCSV(trimmedText);
      fileType = 'csv';
    }

    // Limit to 200 rows
    const limitedData = parsedData.slice(0, 200);

    const uploadId = `u_${uuidv4().split('-')[0]}`;
    const upload = new Upload();
    upload.id = uploadId;
    upload.country = country || null;
    upload.erp = erp || null;
    upload.rows_parsed = limitedData.length;
    upload.file_data = limitedData;
    upload.file_type = fileType;

    await this.uploadRepository.save(upload);
    return uploadId;
  }

  async getUpload(uploadId: string): Promise<Upload> {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    return upload;
  }

  private detectFileType(file: MulterFile): string {
    const mimeType = file.mimetype;
    const originalName = file.originalname.toLowerCase();

    if (
      mimeType === 'application/json' ||
      mimeType === 'text/json' ||
      originalName.endsWith('.json')
    ) {
      return 'json';
    } else if (
      mimeType === 'text/csv' ||
      mimeType === 'application/csv' ||
      originalName.endsWith('.csv')
    ) {
      return 'csv';
    }

    // Try to detect by content
    const content = file.buffer.toString('utf-8').trim();
    if (content.startsWith('[') || content.startsWith('{')) {
      return 'json';
    }

    return 'csv';
  }

  private parseJSON(content: string): InvoiceData {
    try {
      const parsed: unknown = JSON.parse(content);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      return data as InvoiceData;
    } catch {
      throw new BadRequestException('Invalid JSON format');
    }
  }

  private async parseCSV(content: string): Promise<InvoiceData> {
    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, unknown>>(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header: string) => {
          return header.trim();
        },
        complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
          if (results.errors.length > 0) {
            reject(new BadRequestException('CSV parsing error'));
          }
          // Transform flat CSV structure to nested structure if needed
          const transformedData = this.transformCSVToNested(results.data);
          resolve(transformedData);
        },
        error: (error: Error) => {
          reject(
            new BadRequestException(`CSV parsing error: ${error.message}`),
          );
        },
      });
    });
  }

  private transformCSVToNested(data: Record<string, unknown>[]): InvoiceData {
    // Transform flat CSV data into nested structure for lines
    return data.map((row) => {
      const transformed: Record<string, unknown> = {};
      const lineData: Record<string, unknown> = {};

      Object.keys(row).forEach((key) => {
        if (key.startsWith('line')) {
          lineData[key] = row[key];
        } else {
          transformed[key] = row[key];
        }
      });

      // If there are line items, add them to the lines array
      if (Object.keys(lineData).length > 0) {
        transformed.lines = [lineData];
      }

      return transformed as InvoiceRow;
    });
  }
}
