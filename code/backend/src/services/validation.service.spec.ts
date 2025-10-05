import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { InvoiceData } from '../types/invoice.types';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  describe('validateData', () => {
    it('should validate clean data successfully', () => {
      const data: InvoiceData = [
        {
          inv_id: 'INV-1001',
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
            {
              sku: 'B2',
              qty: 5,
              unit_price: 100,
              line_total: 500,
            },
          ],
        },
      ];

      const result = service.validateData(data);

      expect(result.ruleFindings).toHaveLength(5);
      expect(result.ruleFindings.every((finding) => finding.ok)).toBe(true);
      expect(result.gaps).toHaveLength(0);
    });

    it('should detect totals balance error', () => {
      const data: InvoiceData = [
        {
          total_excl_vat: 1000,
          vat_amount: 50,
          total_incl_vat: 1060, // Should be 1050
        },
      ];

      const result = service.validateData(data);

      const totalsBalanceFinding = result.ruleFindings.find(
        (f) => f.rule === 'TOTALS_BALANCE',
      );
      expect(totalsBalanceFinding?.ok).toBe(false);
      expect(result.gaps).toContain(
        'Total amounts do not balance (total_excl_vat + vat_amount != total_incl_vat)',
      );
    });

    it('should detect line math error', () => {
      const data: InvoiceData = [
        {
          lines: [
            {
              qty: 5,
              unit_price: 100,
              line_total: 400, // Should be 500
            },
          ],
        },
      ];

      const result = service.validateData(data);

      const lineMathFinding = result.ruleFindings.find(
        (f) => f.rule === 'LINE_MATH',
      );
      expect(lineMathFinding?.ok).toBe(false);
      expect(lineMathFinding?.exampleLine).toBe(1);
      expect(lineMathFinding?.expected).toBe(500);
      expect(lineMathFinding?.got).toBe(400);
      expect(result.gaps).toContain(
        'Line math error: line_total should equal qty * unit_price',
      );
    });

    it('should detect invalid date format', () => {
      const data: InvoiceData = [
        {
          date: '2025-13-45', // Invalid date
        },
      ];

      const result = service.validateData(data);

      const dateFinding = result.ruleFindings.find(
        (f) => f.rule === 'DATE_ISO',
      );
      expect(dateFinding?.ok).toBe(false);
      expect(dateFinding?.value).toBe('2025-13-45');
      expect(result.gaps).toContain(
        'Invalid date format: 2025-13-45. Use ISO format YYYY-MM-DD',
      );
    });

    it('should detect invalid date values', () => {
      const data: InvoiceData = [
        {
          date: '2025-13-12', // Invalid month
        },
      ];

      const result = service.validateData(data);

      const dateFinding = result.ruleFindings.find(
        (f) => f.rule === 'DATE_ISO',
      );
      expect(dateFinding?.ok).toBe(false);
      expect(dateFinding?.value).toBe('2025-13-12');
    });

    it('should detect invalid currency', () => {
      const data: InvoiceData = [
        {
          currency: 'EURO', // Not in allowed list
        },
      ];

      const result = service.validateData(data);

      const currencyFinding = result.ruleFindings.find(
        (f) => f.rule === 'CURRENCY_ALLOWED',
      );
      expect(currencyFinding?.ok).toBe(false);
      expect(currencyFinding?.value).toBe('EURO');
      expect(result.gaps).toContain(
        'Invalid currency EURO. Allowed: AED, SAR, MYR, USD',
      );
    });

    it('should detect missing TRN', () => {
      const data: InvoiceData = [
        {
          seller_trn: '123456',
          // Missing buyer_trn
        },
      ];

      const result = service.validateData(data);

      const trnFinding = result.ruleFindings.find(
        (f) => f.rule === 'TRN_PRESENT',
      );
      expect(trnFinding?.ok).toBe(false);
      expect(trnFinding?.details).toBe('Missing buyer.trn');
      expect(result.gaps).toContain('Missing buyer.trn');
    });

    it('should handle multiple validation errors', () => {
      const data: InvoiceData = [
        {
          date: '2025-13-45', // Invalid date
          currency: 'EURO', // Invalid currency
          total_excl_vat: 1000,
          vat_amount: 50,
          total_incl_vat: 1060, // Balance error
          seller_trn: '123456',
          buyer_trn: '654321',
          lines: [
            {
              qty: 5,
              unit_price: 100,
              line_total: 400, // Math error
            },
          ],
        },
      ];

      const result = service.validateData(data);

      expect(result.ruleFindings.filter((f) => !f.ok)).toHaveLength(4);
      expect(result.gaps).toHaveLength(4);
    });

    it('should handle empty data', () => {
      const result = service.validateData([]);

      expect(result.ruleFindings).toHaveLength(5);
      expect(result.ruleFindings.every((f) => f.ok)).toBe(true);
      expect(result.gaps).toHaveLength(0);
    });

    it('should handle data without lines array', () => {
      const data: InvoiceData = [
        {
          qty: 5,
          unit_price: 100,
          line_total: 500,
          seller_trn: '123456',
          buyer_trn: '654321',
        },
      ];

      const result = service.validateData(data);

      const lineMathFinding = result.ruleFindings.find(
        (f) => f.rule === 'LINE_MATH',
      );
      expect(lineMathFinding?.ok).toBe(true);
    });
  });
});
