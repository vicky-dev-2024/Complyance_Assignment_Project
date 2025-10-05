import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { CoverageDto, RuleFindingDto } from '../dto/report.dto';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  describe('calculateScores', () => {
    it('should calculate perfect scores', () => {
      const coverage: CoverageDto = {
        matched: [
          'invoice.id',
          'invoice.issue_date',
          'invoice.currency',
          'invoice.total_excl_vat',
          'invoice.vat_amount',
          'invoice.total_incl_vat',
          'seller.name',
          'seller.trn',
          'seller.country',
          'buyer.name',
          'buyer.trn',
          'buyer.country',
          'lines[].sku',
          'lines[].qty',
          'lines[].unit_price',
          'lines[].line_total',
        ],
        close: [],
        missing: [],
      };

      const ruleFindings: RuleFindingDto[] = [
        { rule: 'TOTALS_BALANCE', ok: true },
        { rule: 'LINE_MATH', ok: true },
        { rule: 'DATE_ISO', ok: true },
        { rule: 'CURRENCY_ALLOWED', ok: true },
        { rule: 'TRN_PRESENT', ok: true },
      ];

      const questionnaire = {
        webhooks: true,
        sandbox_env: true,
        retries: true,
      };

      const result = service.calculateScores(
        100,
        100,
        coverage,
        ruleFindings,
        questionnaire,
      );

      expect(result.data).toBe(100);
      expect(result.coverage).toBe(100);
      expect(result.rules).toBe(100);
      expect(result.posture).toBe(100);
      expect(result.overall).toBe(100);
    });

    it('should calculate mixed scores correctly', () => {
      const coverage: CoverageDto = {
        matched: ['invoice.id', 'invoice.issue_date'],
        close: [
          { target: 'invoice.currency', candidate: 'curr', confidence: 0.85 },
        ],
        missing: ['seller.name'],
      };

      const ruleFindings: RuleFindingDto[] = [
        { rule: 'TOTALS_BALANCE', ok: true },
        { rule: 'LINE_MATH', ok: false },
        { rule: 'DATE_ISO', ok: true },
        { rule: 'CURRENCY_ALLOWED', ok: true },
        { rule: 'TRN_PRESENT', ok: true },
      ];

      const questionnaire = {
        webhooks: true,
        sandbox_env: false,
        retries: true,
      };

      const result = service.calculateScores(
        80,
        100,
        coverage,
        ruleFindings,
        questionnaire,
      );

      expect(result.data).toBe(80); // 80/100 parsed
      expect(result.coverage).toBeGreaterThan(0);
      expect(result.rules).toBe(80); // 4/5 rules passed
      expect(result.posture).toBe(67); // 2/3 questionnaire answers true
      expect(result.overall).toBeGreaterThan(0);
    });

    it('should handle zero data score', () => {
      const coverage: CoverageDto = { matched: [], close: [], missing: [] };
      const ruleFindings: RuleFindingDto[] = [];
      const questionnaire = {
        webhooks: false,
        sandbox_env: false,
        retries: false,
      };

      const result = service.calculateScores(
        0,
        100,
        coverage,
        ruleFindings,
        questionnaire,
      );

      expect(result.data).toBe(0);
      expect(result.coverage).toBe(0);
      expect(result.rules).toBe(0);
      expect(result.posture).toBe(0);
      expect(result.overall).toBe(0);
    });

    it('should handle empty rule findings', () => {
      const coverage: CoverageDto = { matched: [], close: [], missing: [] };
      const ruleFindings: RuleFindingDto[] = [];
      const questionnaire = {
        webhooks: false,
        sandbox_env: false,
        retries: false,
      };

      const result = service.calculateScores(
        50,
        100,
        coverage,
        ruleFindings,
        questionnaire,
      );

      expect(result.rules).toBe(0);
    });
  });

  describe('calculateDataScore', () => {
    it('should calculate data score correctly', () => {
      expect(service['calculateDataScore'](100, 100)).toBe(100);
      expect(service['calculateDataScore'](50, 100)).toBe(50);
      expect(service['calculateDataScore'](0, 100)).toBe(0);
      expect(service['calculateDataScore'](0, 0)).toBe(0);
    });
  });

  describe('calculateCoverageScore', () => {
    it('should calculate coverage score with all matched', () => {
      const coverage: CoverageDto = {
        matched: [
          'invoice.id',
          'invoice.issue_date',
          'invoice.currency',
          'invoice.total_excl_vat',
          'invoice.vat_amount',
          'invoice.total_incl_vat',
          'seller.name',
          'seller.trn',
          'seller.country',
          'buyer.name',
          'buyer.trn',
          'buyer.country',
          'lines[].sku',
          'lines[].qty',
          'lines[].unit_price',
          'lines[].line_total',
        ],
        close: [],
        missing: [],
      };

      const score = service['calculateCoverageScore'](coverage);
      expect(score).toBe(100);
    });

    it('should calculate coverage score with close matches', () => {
      const coverage: CoverageDto = {
        matched: ['invoice.id'],
        close: [
          { target: 'invoice.issue_date', candidate: 'date', confidence: 0.85 },
        ],
        missing: [],
      };

      const score = service['calculateCoverageScore'](coverage);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });

    it('should handle empty coverage', () => {
      const coverage: CoverageDto = { matched: [], close: [], missing: [] };
      const score = service['calculateCoverageScore'](coverage);
      expect(score).toBe(0);
    });
  });

  describe('calculateRulesScore', () => {
    it('should calculate rules score correctly', () => {
      const ruleFindings: RuleFindingDto[] = [
        { rule: 'TOTALS_BALANCE', ok: true },
        { rule: 'LINE_MATH', ok: true },
        { rule: 'DATE_ISO', ok: false },
        { rule: 'CURRENCY_ALLOWED', ok: true },
        { rule: 'TRN_PRESENT', ok: true },
      ];

      const score = service['calculateRulesScore'](ruleFindings);
      expect(score).toBe(80); // 4 out of 5 passed
    });

    it('should handle empty rule findings', () => {
      const score = service['calculateRulesScore']([]);
      expect(score).toBe(0);
    });
  });

  describe('calculatePostureScore', () => {
    it('should calculate posture score correctly', () => {
      expect(
        service['calculatePostureScore']({
          webhooks: true,
          sandbox_env: true,
          retries: true,
        }),
      ).toBe(100);
      expect(
        service['calculatePostureScore']({
          webhooks: true,
          sandbox_env: false,
          retries: true,
        }),
      ).toBe(67);
      expect(
        service['calculatePostureScore']({
          webhooks: false,
          sandbox_env: false,
          retries: false,
        }),
      ).toBe(0);
    });
  });

  describe('getReadinessLabel', () => {
    it('should return correct readiness labels', () => {
      expect(service.getReadinessLabel(85)).toBe('High');
      expect(service.getReadinessLabel(80)).toBe('High');
      expect(service.getReadinessLabel(79)).toBe('Medium');
      expect(service.getReadinessLabel(50)).toBe('Medium');
      expect(service.getReadinessLabel(49)).toBe('Low');
      expect(service.getReadinessLabel(0)).toBe('Low');
    });
  });
});
