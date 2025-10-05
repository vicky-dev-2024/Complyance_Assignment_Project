import { Test, TestingModule } from '@nestjs/testing';
import { FieldMapperService } from './field-mapper.service';
import { InvoiceData } from '../types/invoice.types';

// Mock the levenshtein-edit-distance module
jest.mock('levenshtein-edit-distance', () => ({
  levenshteinEditDistance: jest.fn((str1: string, str2: string) => {
    // Simple mock implementation
    return Math.abs(str1.length - str2.length);
  }),
}));

describe('FieldMapperService', () => {
  let service: FieldMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMapperService],
    }).compile();

    service = module.get<FieldMapperService>(FieldMapperService);
  });

  describe('mapFields', () => {
    it('should return empty coverage for empty data', () => {
      const result = service.mapFields([]);

      expect(result.matched).toEqual([]);
      expect(result.close).toEqual([]);
      expect(result.missing).toContain('invoice.id');
      expect(result.missing).toContain('invoice.issue_date');
    });

    it('should map exact field matches', () => {
      const data: InvoiceData = [
        {
          inv_id: 'INV-1001',
          date: '2025-01-15',
          currency: 'AED',
          seller_name: 'Test Seller',
          seller_trn: '123456',
          seller_country: 'AE',
          buyer_name: 'Test Buyer',
          buyer_trn: '654321',
          buyer_country: 'AE',
          total_excl_vat: 1000,
          vat_amount: 50,
          total_incl_vat: 1050,
          sku: 'A1', // Flat structure for lines
          qty: 5,
          unit_price: 100,
          line_total: 500,
        },
      ];

      const result = service.mapFields(data);

      expect(result.matched).toContain('invoice.id');
      expect(result.matched).toContain('invoice.issue_date');
      expect(result.matched).toContain('invoice.currency');
      expect(result.matched).toContain('seller.name');
      expect(result.matched).toContain('seller.trn');
      expect(result.matched).toContain('buyer.name');
      expect(result.matched).toContain('buyer.trn');
      expect(result.matched).toContain('lines[].sku');
      expect(result.matched).toContain('lines[].qty');
      expect(result.matched).toContain('lines[].unit_price');
      expect(result.matched).toContain('lines[].line_total');
    });

    it('should find close matches for similar field names', () => {
      const data: InvoiceData = [
        {
          invoice_number: 'INV-1001',
          issued_on: '2025-01-15',
          curr: 'AED',
          sellerName: 'Test Seller',
          sellerTax: '123456',
          buyerName: 'Test Buyer',
          buyerTax: '654321',
          totalNet: 1000,
          vat: 50,
          grandTotal: 1050,
          lineSku: 'A1',
          lineQty: 5,
          linePrice: 100,
          lineTotal: 500,
        },
      ];

      const result = service.mapFields(data);

      expect(result.close.length).toBeGreaterThan(0);
      // Check that some expected fields are either matched or close
      const allFound = result.matched.concat(result.close.map((c) => c.target));
      expect(allFound).toEqual(
        expect.arrayContaining(['invoice.id', 'invoice.issue_date']),
      );
    });

    it('should handle nested fields correctly', () => {
      const data: InvoiceData = [
        {
          inv_id: 'INV-1001',
          sku: 'A1',
          qty: 5,
        },
      ];

      const result = service.mapFields(data);

      expect(result.matched).toContain('invoice.id');
      expect(result.matched).toContain('lines[].sku');
      expect(result.matched).toContain('lines[].qty');
    });

    it('should handle empty data', () => {
      const result = service.mapFields([]);

      expect(result.matched).toEqual([]);
      expect(result.close).toEqual([]);
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });
});
