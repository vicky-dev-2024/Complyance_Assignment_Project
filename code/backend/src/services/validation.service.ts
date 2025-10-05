import { Injectable } from '@nestjs/common';
import { RuleFindingDto } from '../dto/report.dto';
import { ALLOWED_CURRENCIES } from '../config/gets-schema.config';
import {
  InvoiceData,
  InvoiceLine,
  getStringField,
  getNumericField,
} from '../types/invoice.types';

@Injectable()
export class ValidationService {
  validateData(data: InvoiceData): {
    ruleFindings: RuleFindingDto[];
    gaps: string[];
  } {
    const ruleFindings: RuleFindingDto[] = [];
    const gaps: string[] = [];

    // Rule 1: TOTALS_BALANCE
    const totalsBalanceResult = this.checkTotalsBalance(data);
    ruleFindings.push(totalsBalanceResult.finding);
    if (!totalsBalanceResult.finding.ok && totalsBalanceResult.gap) {
      gaps.push(totalsBalanceResult.gap);
    }

    // Rule 2: LINE_MATH
    const lineMathResult = this.checkLineMath(data);
    ruleFindings.push(lineMathResult.finding);
    if (!lineMathResult.finding.ok && lineMathResult.gap) {
      gaps.push(lineMathResult.gap);
    }

    // Rule 3: DATE_ISO
    const dateIsoResult = this.checkDateISO(data);
    ruleFindings.push(dateIsoResult.finding);
    if (!dateIsoResult.finding.ok && dateIsoResult.gap) {
      gaps.push(dateIsoResult.gap);
    }

    // Rule 4: CURRENCY_ALLOWED
    const currencyResult = this.checkCurrencyAllowed(data);
    ruleFindings.push(currencyResult.finding);
    if (!currencyResult.finding.ok && currencyResult.gap) {
      gaps.push(currencyResult.gap);
    }

    // Rule 5: TRN_PRESENT
    const trnPresentResult = this.checkTRNPresent(data);
    ruleFindings.push(trnPresentResult.finding);
    if (!trnPresentResult.finding.ok && trnPresentResult.gap) {
      gaps.push(trnPresentResult.gap);
    }

    return { ruleFindings, gaps };
  }

  private checkTotalsBalance(data: InvoiceData): {
    finding: RuleFindingDto;
    gap?: string;
  } {
    let hasError = false;
    let errorDetails = '';

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const totalExclVat = getNumericField(row, [
        'total_excl_vat',
        'totalNet',
        'total_net',
      ]);
      const vatAmount = getNumericField(row, [
        'vat_amount',
        'vat',
        'tax_amount',
      ]);
      const totalInclVat = getNumericField(row, [
        'total_incl_vat',
        'grandTotal',
        'grand_total',
      ]);

      if (
        totalExclVat !== null &&
        vatAmount !== null &&
        totalInclVat !== null
      ) {
        const expected = totalExclVat + vatAmount;
        const diff = Math.abs(expected - totalInclVat);

        if (diff > 0.01) {
          hasError = true;
          errorDetails = `Row ${i + 1}: Expected ${expected.toFixed(2)}, got ${totalInclVat.toFixed(2)}`;
          break;
        }
      }
    }

    return {
      finding: {
        rule: 'TOTALS_BALANCE',
        ok: !hasError,
        ...(hasError && { details: errorDetails }),
      },
      gap: hasError
        ? 'Total amounts do not balance (total_excl_vat + vat_amount != total_incl_vat)'
        : undefined,
    };
  }

  private checkLineMath(data: InvoiceData): {
    finding: RuleFindingDto;
    gap?: string;
  } {
    let hasError = false;
    let exampleLine: number | undefined;
    let expected: number | undefined;
    let got: number | undefined;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const lines: InvoiceLine[] = (row.lines || [row]) as InvoiceLine[];

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        const qty = getNumericField(line, [
          'qty',
          'quantity',
          'lineQty',
          'line_qty',
        ]);
        const unitPrice = getNumericField(line, [
          'unit_price',
          'unitPrice',
          'price',
          'linePrice',
          'line_price',
        ]);
        const lineTotal = getNumericField(line, [
          'line_total',
          'lineTotal',
          'total',
          'amount',
        ]);

        if (qty !== null && unitPrice !== null && lineTotal !== null) {
          const expectedTotal = qty * unitPrice;
          const diff = Math.abs(expectedTotal - lineTotal);

          if (diff > 0.01) {
            hasError = true;
            exampleLine = i + 1;
            expected = Math.round(expectedTotal * 100) / 100;
            got = Math.round(lineTotal * 100) / 100;
            break;
          }
        }
      }

      if (hasError) break;
    }

    return {
      finding: {
        rule: 'LINE_MATH',
        ok: !hasError,
        ...(hasError && { exampleLine, expected, got }),
      },
      gap: hasError
        ? `Line math error: line_total should equal qty * unit_price`
        : undefined,
    };
  }

  private checkDateISO(data: InvoiceData): {
    finding: RuleFindingDto;
    gap?: string;
  } {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    let hasError = false;
    let invalidDate = '';

    for (const row of data) {
      const date = getStringField(row, [
        'issue_date',
        'date',
        'invoice_date',
        'issued_on',
      ]);

      if (date) {
        // Handle dates with time (2025/01/10 or 2025-01-10)
        const dateOnly = date.split(' ')[0];
        const normalizedDate = dateOnly.replace(/\//g, '-');

        if (!isoDateRegex.test(normalizedDate)) {
          hasError = true;
          invalidDate = date;
          break;
        }

        // Additional validation: check if it's a valid date
        const parts = normalizedDate.split('-');
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);

        if (month < 1 || month > 12 || day < 1 || day > 31) {
          hasError = true;
          invalidDate = date;
          break;
        }
      }
    }

    return {
      finding: {
        rule: 'DATE_ISO',
        ok: !hasError,
        ...(hasError && { value: invalidDate }),
      },
      gap: hasError
        ? `Invalid date format: ${invalidDate}. Use ISO format YYYY-MM-DD`
        : undefined,
    };
  }

  private checkCurrencyAllowed(data: InvoiceData): {
    finding: RuleFindingDto;
    gap?: string;
  } {
    let hasError = false;
    let invalidCurrency = '';

    for (const row of data) {
      const currency = getStringField(row, [
        'currency',
        'curr',
        'invoice_currency',
      ]);

      if (currency && !ALLOWED_CURRENCIES.includes(currency.toUpperCase())) {
        hasError = true;
        invalidCurrency = currency;
        break;
      }
    }

    return {
      finding: {
        rule: 'CURRENCY_ALLOWED',
        ok: !hasError,
        ...(hasError && { value: invalidCurrency }),
      },
      gap: hasError
        ? `Invalid currency ${invalidCurrency}. Allowed: ${ALLOWED_CURRENCIES.join(', ')}`
        : undefined,
    };
  }

  private checkTRNPresent(data: InvoiceData): {
    finding: RuleFindingDto;
    gap?: string;
  } {
    let hasError = false;
    let missingTRN = '';

    for (const row of data) {
      const buyerTrn = getStringField(row, [
        'buyer_trn',
        'buyer.trn',
        'buyerTax',
        'buyer_tax_id',
      ]);
      const sellerTrn = getStringField(row, [
        'seller_trn',
        'seller.trn',
        'sellerTax',
        'seller_tax_id',
      ]);

      if (!buyerTrn || buyerTrn.trim() === '') {
        hasError = true;
        missingTRN = 'buyer.trn';
        break;
      }

      if (!sellerTrn || sellerTrn.trim() === '') {
        hasError = true;
        missingTRN = 'seller.trn';
        break;
      }
    }

    return {
      finding: {
        rule: 'TRN_PRESENT',
        ok: !hasError,
        ...(hasError && { details: `Missing ${missingTRN}` }),
      },
      gap: hasError ? `Missing ${missingTRN}` : undefined,
    };
  }
}
