import { Injectable } from '@nestjs/common';
import { GETS_SCHEMA } from '../config/gets-schema.config';
import { levenshteinEditDistance } from 'levenshtein-edit-distance';
import { CoverageDto, CoverageMatchDto } from '../dto/report.dto';
import { InvoiceData } from '../types/invoice.types';

@Injectable()
export class FieldMapperService {
  private normalizeFieldName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[_\s-]+/g, '')
      .trim();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = this.normalizeFieldName(str1);
    const normalized2 = this.normalizeFieldName(str2);

    if (normalized1 === normalized2) return 1.0;

    // Check if one contains the other
    if (
      normalized1.includes(normalized2) ||
      normalized2.includes(normalized1)
    ) {
      return 0.85;
    }

    // Check startsWith
    if (
      normalized1.startsWith(normalized2) ||
      normalized2.startsWith(normalized1)
    ) {
      return 0.75;
    }

    // Calculate Levenshtein distance
    const dist = levenshteinEditDistance(normalized1, normalized2);
    const maxLen = Math.max(normalized1.length, normalized2.length);
    const similarity = 1 - dist / maxLen;

    return similarity;
  }

  private isTypeCompatible(value: unknown, expectedType: string): boolean {
    if (value === null || value === undefined) return false;

    switch (expectedType) {
      case 'string':
        return typeof value === 'string' || typeof value === 'number';
      case 'number':
        if (typeof value === 'number') return true;
        if (typeof value === 'string') {
          const num = parseFloat(value);
          return !isNaN(num) && isFinite(num);
        }
        return false;
      case 'date':
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
      case 'enum':
        return typeof value === 'string';
      default:
        return true;
    }
  }

  mapFields(data: InvoiceData): CoverageDto {
    const matched: string[] = [];
    const close: CoverageMatchDto[] = [];
    const missing: string[] = [];

    if (!data || data.length === 0) {
      GETS_SCHEMA.fields.forEach((field) => {
        if (field.required) {
          missing.push(field.path);
        }
      });
      return { matched, close, missing };
    }

    // Get all possible field names from the data
    const dataFields = this.extractAllFields(data[0]);

    GETS_SCHEMA.fields.forEach((schemaField) => {
      let bestMatch: { field: string; confidence: number } | null = null;

      // Check exact matches first (including aliases)
      const aliases = schemaField.aliases || [];
      for (const dataField of dataFields) {
        const normalizedDataField = this.normalizeFieldName(dataField);

        // Check exact match with schema path
        const schemaPathNormalized = this.normalizeFieldName(
          schemaField.path.replace('[]', '').split('.').pop() || '',
        );

        if (normalizedDataField === schemaPathNormalized) {
          // Get sample value to check type compatibility
          const sampleValue = this.getFieldValue(data[0], dataField);
          if (this.isTypeCompatible(sampleValue, schemaField.type)) {
            matched.push(schemaField.path);
            return;
          }
        }

        // Check aliases
        for (const alias of aliases) {
          const normalizedAlias = this.normalizeFieldName(alias);
          if (normalizedDataField === normalizedAlias) {
            const sampleValue = this.getFieldValue(data[0], dataField);
            if (this.isTypeCompatible(sampleValue, schemaField.type)) {
              matched.push(schemaField.path);
              return;
            }
          }
        }
      }

      // If no exact match, find close matches
      for (const dataField of dataFields) {
        const similarity = this.calculateSimilarity(
          dataField,
          schemaField.path.split('.').pop() || '',
        );

        // Check similarity with aliases
        for (const alias of aliases) {
          const aliasSimilarity = this.calculateSimilarity(dataField, alias);
          if (aliasSimilarity > similarity) {
            const sampleValue = this.getFieldValue(data[0], dataField);
            if (
              aliasSimilarity >= 0.65 &&
              this.isTypeCompatible(sampleValue, schemaField.type)
            ) {
              if (!bestMatch || aliasSimilarity > bestMatch.confidence) {
                bestMatch = {
                  field: dataField,
                  confidence: aliasSimilarity,
                };
              }
            }
          }
        }

        // Check direct similarity
        const sampleValue = this.getFieldValue(data[0], dataField);
        if (
          similarity >= 0.65 &&
          this.isTypeCompatible(sampleValue, schemaField.type)
        ) {
          if (!bestMatch || similarity > bestMatch.confidence) {
            bestMatch = { field: dataField, confidence: similarity };
          }
        }
      }

      if (bestMatch && bestMatch.confidence >= 0.65) {
        close.push({
          target: schemaField.path,
          candidate: bestMatch.field,
          confidence: Math.round(bestMatch.confidence * 100) / 100,
        });
      } else if (schemaField.required) {
        missing.push(schemaField.path);
      }
    });

    return { matched, close, missing };
  }

  private extractAllFields(
    obj: Record<string, unknown>,
    prefix = '',
  ): string[] {
    const fields: string[] = [];

    if (!obj || typeof obj !== 'object') return fields;

    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === 'object' &&
          value[0] !== null
        ) {
          // For arrays of objects, extract fields from first item
          const subFields = this.extractAllFields(
            value[0] as Record<string, unknown>,
            key,
          );
          fields.push(...subFields);
        } else {
          fields.push(fullKey);
        }
      } else if (typeof value === 'object' && value !== null) {
        const subFields = this.extractAllFields(
          value as Record<string, unknown>,
          fullKey,
        );
        fields.push(...subFields);
      } else {
        fields.push(fullKey);
      }
    });

    return fields;
  }

  private getFieldValue(
    obj: Record<string, unknown>,
    fieldPath: string,
  ): unknown {
    const parts = fieldPath.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return null;

      if (Array.isArray(current)) {
        current = current[0];
      }

      if (typeof current === 'object' && current !== null && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }

    return current;
  }
}
