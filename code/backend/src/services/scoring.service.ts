import { Injectable } from '@nestjs/common';
import { ScoresDto, CoverageDto, RuleFindingDto } from '../dto/report.dto';
import { GETS_SCHEMA } from '../config/gets-schema.config';

@Injectable()
export class ScoringService {
  /**
   * Calculate all scores based on the analysis results
   * Weights:
   * - Data: 25%
   * - Coverage: 35%
   * - Rules: 30%
   * - Posture: 10%
   */
  calculateScores(
    rowsParsed: number,
    totalRows: number,
    coverage: CoverageDto,
    ruleFindings: RuleFindingDto[],
    questionnaire: {
      webhooks: boolean;
      sandbox_env: boolean;
      retries: boolean;
    },
  ): ScoresDto {
    const dataScore = this.calculateDataScore(rowsParsed, totalRows);
    const coverageScore = this.calculateCoverageScore(coverage);
    const rulesScore = this.calculateRulesScore(ruleFindings);
    const postureScore = this.calculatePostureScore(questionnaire);

    // Calculate overall score with weights
    const overall = Math.round(
      dataScore * 0.25 +
        coverageScore * 0.35 +
        rulesScore * 0.3 +
        postureScore * 0.1,
    );

    return {
      data: dataScore,
      coverage: coverageScore,
      rules: rulesScore,
      posture: postureScore,
      overall,
    };
  }

  /**
   * Data Score (25%): Share of rows parsed; basic type inference success
   * - 100 if all rows parsed successfully
   * - Proportional based on parsed vs total
   */
  private calculateDataScore(rowsParsed: number, totalRows: number): number {
    if (totalRows === 0) return 0;

    const parseRate = rowsParsed / totalRows;
    return Math.round(parseRate * 100);
  }

  /**
   * Coverage Score (35%): Matched required fields vs GETS
   * Weight header/seller/buyer slightly higher than lines
   */
  private calculateCoverageScore(coverage: CoverageDto): number {
    const requiredFields = GETS_SCHEMA.fields.filter((f) => f.required);
    const totalRequired = requiredFields.length;

    if (totalRequired === 0) return 100;

    // Count matched fields (full weight)
    const matchedCount = coverage.matched.length;

    // Count close matches (80% weight)
    const closeCount = coverage.close.length * 0.8;

    // Calculate score
    const score = ((matchedCount + closeCount) / totalRequired) * 100;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Rules Score (30%): Equality-weighted across the 5 checks
   */
  private calculateRulesScore(ruleFindings: RuleFindingDto[]): number {
    if (ruleFindings.length === 0) return 0;

    const passedRules = ruleFindings.filter((r) => r.ok).length;
    const totalRules = ruleFindings.length;

    return Math.round((passedRules / totalRules) * 100);
  }

  /**
   * Posture Score (10%): From questionnaire (webhooks, sandbox_env, retries)
   * Each question contributes equally
   */
  private calculatePostureScore(questionnaire: {
    webhooks: boolean;
    sandbox_env: boolean;
    retries: boolean;
  }): number {
    const trueCount = [
      questionnaire.webhooks,
      questionnaire.sandbox_env,
      questionnaire.retries,
    ].filter(Boolean).length;

    return Math.round((trueCount / 3) * 100);
  }

  /**
   * Get readiness label based on overall score
   */
  getReadinessLabel(overallScore: number): string {
    if (overallScore >= 80) return 'High';
    if (overallScore >= 50) return 'Medium';
    return 'Low';
  }
}
