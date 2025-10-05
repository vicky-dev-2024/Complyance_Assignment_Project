/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../src/entities/report.entity';
import { Upload } from '../src/entities/upload.entity';

interface HealthResponse {
  status: string;
  database: {
    type: string;
    connected: boolean;
  };
  timestamp: string;
}

interface UploadResponse {
  uploadId: string;
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let reportRepository: Repository<Report>;
  let uploadRepository: Repository<Upload>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    reportRepository = moduleFixture.get<Repository<Report>>(
      getRepositoryToken(Report),
    );
    uploadRepository = moduleFixture.get<Repository<Upload>>(
      getRepositoryToken(Upload),
    );
  });

  afterEach(async () => {
    // Clean up test data
    await reportRepository.clear();
    await uploadRepository.clear();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          const body = res.body as HealthResponse;
          expect(body).toHaveProperty('status');
          expect(body).toHaveProperty('database');
          expect(body).toHaveProperty('timestamp');
          expect(body.database).toHaveProperty('type', 'postgres');
          expect(body.database).toHaveProperty('connected');
        });
    });
  });

  describe('/upload (POST)', () => {
    it('should upload JSON data successfully', () => {
      const testData = [
        {
          inv_id: 'TEST-001',
          date: '2025-01-15',
          currency: 'AED',
          seller_name: 'Test Seller',
          seller_trn: '123456',
          buyer_name: 'Test Buyer',
          buyer_trn: '654321',
          total_excl_vat: 1000,
          vat_amount: 50,
          total_incl_vat: 1050,
        },
      ];

      return request(app.getHttpServer())
        .post('/upload')
        .send({
          text: JSON.stringify(testData),
          country: 'UAE',
          erp: 'SAP',
        })
        .expect(200)
        .expect((res) => {
          const body = res.body as UploadResponse;
          expect(body).toHaveProperty('uploadId');
          expect(typeof body.uploadId).toBe('string');
          expect(body.uploadId).toMatch(/^u_/);
        });
    });

    it('should upload CSV data successfully', () => {
      const csvData = `inv_id,date,currency,seller_name,seller_trn,buyer_name,buyer_trn,total_excl_vat,vat_amount,total_incl_vat
TEST-002,2025-01-16,AED,Test Seller,123456,Test Buyer,654321,2000,100,2100`;

      return request(app.getHttpServer())
        .post('/upload')
        .send({
          text: csvData,
          country: 'UAE',
          erp: 'SAP',
        })
        .expect(200)
        .expect((res) => {
          const body = res.body as UploadResponse;
          expect(body).toHaveProperty('uploadId');
        });
    });

    it('should reject upload without data', () => {
      return request(app.getHttpServer())
        .post('/upload')
        .send({
          country: 'UAE',
          erp: 'SAP',
        })
        .expect(400);
    });

    it('should reject invalid JSON', () => {
      return request(app.getHttpServer())
        .post('/upload')
        .send({
          text: 'invalid json',
          country: 'UAE',
          erp: 'SAP',
        })
        .expect(400);
    });
  });

  describe('/analyze (POST)', () => {
    let uploadId: string;

    beforeEach(async () => {
      // Create a test upload first
      const testData = [
        {
          inv_id: 'TEST-001',
          date: '2025-01-15',
          currency: 'AED',
          seller_name: 'Test Seller',
          seller_trn: '123456',
          buyer_name: 'Test Buyer',
          buyer_trn: '654321',
          total_excl_vat: 1000,
          vat_amount: 50,
          total_incl_vat: 1050,
          lines: [
            {
              sku: 'A1',
              qty: 5,
              unit_price: 100,
              line_total: 500,
            },
          ],
        },
      ];

      const uploadResponse = await request(app.getHttpServer())
        .post('/upload')
        .send({
          text: JSON.stringify(testData),
          country: 'UAE',
          erp: 'SAP',
        });

      uploadId = (uploadResponse.body as UploadResponse).uploadId;
    });

    it('should analyze uploaded data successfully', () => {
      return request(app.getHttpServer())
        .post('/analyze')
        .send({
          uploadId,
          questionnaire: {
            webhooks: true,
            sandbox_env: true,
            retries: false,
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('reportId');
          expect(res.body).toHaveProperty('scores');
          expect(res.body).toHaveProperty('coverage');
          expect(res.body).toHaveProperty('ruleFindings');
          expect(res.body).toHaveProperty('gaps');
          expect(res.body).toHaveProperty('meta');

          expect(res.body.scores).toHaveProperty('data');
          expect(res.body.scores).toHaveProperty('coverage');
          expect(res.body.scores).toHaveProperty('rules');
          expect(res.body.scores).toHaveProperty('posture');
          expect(res.body.scores).toHaveProperty('overall');

          expect(Array.isArray(res.body.ruleFindings)).toBe(true);
          expect(res.body.ruleFindings.length).toBe(5);
        });
    });

    it('should reject analysis with invalid upload ID', () => {
      return request(app.getHttpServer())
        .post('/analyze')
        .send({
          uploadId: 'u_invalid',
          questionnaire: {
            webhooks: true,
            sandbox_env: true,
            retries: false,
          },
        })
        .expect(400);
    });

    it('should reject analysis without questionnaire', () => {
      return request(app.getHttpServer())
        .post('/analyze')
        .send({
          uploadId,
        })
        .expect(400);
    });
  });

  describe('/report/:reportId (GET)', () => {
    let reportId: string;

    beforeEach(async () => {
      // Create upload and analysis first
      const testData = [
        {
          inv_id: 'TEST-001',
          date: '2025-01-15',
          currency: 'AED',
          seller_name: 'Test Seller',
          seller_trn: '123456',
          buyer_name: 'Test Buyer',
          buyer_trn: '654321',
          total_excl_vat: 1000,
          vat_amount: 50,
          total_incl_vat: 1050,
        },
      ];

      const uploadResponse = await request(app.getHttpServer())
        .post('/upload')
        .send({
          text: JSON.stringify(testData),
          country: 'UAE',
          erp: 'SAP',
        });

      const uploadId = uploadResponse.body.uploadId;

      const analyzeResponse = await request(app.getHttpServer())
        .post('/analyze')
        .send({
          uploadId,
          questionnaire: {
            webhooks: true,
            sandbox_env: true,
            retries: false,
          },
        });

      reportId = analyzeResponse.body.reportId;
    });

    it('should retrieve report successfully', () => {
      return request(app.getHttpServer())
        .get(`/report/${reportId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('reportId', reportId);
          expect(res.body).toHaveProperty('scores');
          expect(res.body).toHaveProperty('coverage');
          expect(res.body).toHaveProperty('ruleFindings');
          expect(res.body).toHaveProperty('gaps');
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('should return 404 for non-existent report', () => {
      return request(app.getHttpServer())
        .get('/report/r_nonexistent')
        .expect(404);
    });
  });

  describe('/reports (GET)', () => {
    beforeEach(async () => {
      // Create a test report
      const testData = [
        {
          inv_id: 'TEST-001',
          date: '2025-01-15',
          currency: 'AED',
          seller_name: 'Test Seller',
          seller_trn: '123456',
          buyer_name: 'Test Buyer',
          buyer_trn: '654321',
          total_excl_vat: 1000,
          vat_amount: 50,
          total_incl_vat: 1050,
        },
      ];

      const uploadResponse = await request(app.getHttpServer())
        .post('/upload')
        .send({
          text: JSON.stringify(testData),
          country: 'UAE',
          erp: 'SAP',
        });

      const uploadId = uploadResponse.body.uploadId;

      await request(app.getHttpServer())
        .post('/analyze')
        .send({
          uploadId,
          questionnaire: {
            webhooks: true,
            sandbox_env: true,
            retries: false,
          },
        });
    });

    it('should list recent reports', () => {
      return request(app.getHttpServer())
        .get('/reports')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('uploadId');
          expect(res.body[0]).toHaveProperty('createdAt');
          expect(res.body[0]).toHaveProperty('overallScore');
          expect(res.body[0]).toHaveProperty('expiresAt');
        });
    });

    it('should limit results to 10', () => {
      return request(app.getHttpServer())
        .get('/reports?limit=10')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(10);
        });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON in upload', () => {
      return request(app.getHttpServer())
        .post('/upload')
        .send({
          text: '{invalid json',
          country: 'UAE',
          erp: 'SAP',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('error', 'Bad Request');
        });
    });

    it('should handle invalid upload ID in analyze', () => {
      return request(app.getHttpServer())
        .post('/analyze')
        .send({
          uploadId: 'u_invalid_id',
          questionnaire: {
            webhooks: true,
            sandbox_env: true,
            retries: false,
          },
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});
