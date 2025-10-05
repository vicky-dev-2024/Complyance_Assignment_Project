import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { Upload } from '../entities/upload.entity';
import { BadRequestException } from '@nestjs/common';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '12345678-1234-1234-1234-123456789012'),
}));

describe('UploadService', () => {
  let service: UploadService;

  const mockUploadRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: getRepositoryToken(Upload),
          useValue: mockUploadRepository,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processText', () => {
    it('should process JSON text successfully', async () => {
      const jsonText = JSON.stringify([{ inv_id: 'test' }]);

      mockUploadRepository.save.mockResolvedValue({ id: 'u_abc123' });

      const result = await service.processText(jsonText, 'UAE', 'SAP');

      expect(result).toBe('u_12345678');
      expect(mockUploadRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          country: 'UAE',
          erp: 'SAP',
          file_type: 'json',
        }),
      );
    });

    it('should process CSV text successfully', async () => {
      const csvText = 'inv_id,date\nINV-1001,2025-01-15\n';

      mockUploadRepository.save.mockResolvedValue({ id: 'u_abc123' });

      const result = await service.processText(csvText);

      expect(result).toBe('u_12345678');
      expect(mockUploadRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          file_type: 'csv',
        }),
      );
    });

    it('should throw BadRequestException for invalid JSON text', async () => {
      const invalidJson = 'invalid json';

      await expect(service.processText(invalidJson)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUpload', () => {
    it('should return upload if found', async () => {
      const mockUpload = { id: 'u_abc123', file_data: [{ inv_id: 'test' }] };
      mockUploadRepository.findOne.mockResolvedValue(mockUpload);

      const result = await service.getUpload('u_abc123');

      expect(result).toEqual(mockUpload);
      expect(mockUploadRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u_abc123' },
      });
    });

    it('should throw BadRequestException if upload not found', async () => {
      mockUploadRepository.findOne.mockResolvedValue(null);

      await expect(service.getUpload('u_nonexistent')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
