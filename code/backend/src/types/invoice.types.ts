// Type definitions for invoice data structures

export interface InvoiceLine {
  sku?: string;
  description?: string;
  qty?: number;
  quantity?: number;
  lineQty?: number;
  unit_price?: number;
  unitPrice?: number;
  price?: number;
  linePrice?: number;
  line_price?: number;
  line_total?: number;
  lineTotal?: number;
  total?: number;
  amount?: number;
  [key: string]: unknown; // Allow additional fields
}

export interface InvoiceRow {
  // Invoice identifiers
  inv_id?: string;
  invoice_id?: string;
  inv_no?: string;
  invoice_number?: string;

  // Dates
  date?: string;
  issue_date?: string;
  issued_on?: string;
  invoice_date?: string;

  // Currency
  currency?: string;
  curr?: string;
  invoice_currency?: string;

  // Amounts
  total_excl_vat?: number;
  totalNet?: number;
  total_net?: number;
  net_amount?: number;
  vat_amount?: number;
  vat?: number;
  tax_amount?: number;
  tax?: number;
  total_incl_vat?: number;
  grandTotal?: number;
  grand_total?: number;
  total_amount?: number;
  total?: number;

  // Seller
  seller_name?: string;
  sellerName?: string;
  vendor_name?: string;
  seller_trn?: string;
  seller_tax_id?: string;
  sellerTax?: string;
  vendor_trn?: string;
  seller_country?: string;
  sellerCountry?: string;
  vendor_country?: string;
  seller_city?: string;
  sellerCity?: string;
  vendor_city?: string;

  // Buyer
  buyer_name?: string;
  buyerName?: string;
  customer_name?: string;
  buyer_trn?: string;
  buyer_tax_id?: string;
  buyerTax?: string;
  customer_trn?: string;
  buyer_country?: string;
  buyerCountry?: string;
  customer_country?: string;
  buyer_city?: string;
  buyerCity?: string;
  customer_city?: string;

  // Line items
  lines?: InvoiceLine[];

  // CSV flat line fields
  lineSku?: string;
  line_sku?: string;
  lineQty?: number;
  line_qty?: number;
  linePrice?: number;
  line_price?: number;
  lineTotal?: number;
  line_total?: number;

  [key: string]: unknown; // Allow additional fields
}

export type InvoiceData = InvoiceRow[];

export type MulterFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

// Type guard to check if value is an InvoiceRow
export function isInvoiceRow(value: unknown): value is InvoiceRow {
  return typeof value === 'object' && value !== null;
}

// Type guard to check if value is InvoiceData array
export function isInvoiceData(value: unknown): value is InvoiceData {
  return Array.isArray(value);
}

// Helper to safely get string value from object
export function getStringField(
  obj: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current: unknown = obj;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          current = null;
          break;
        }
      }
      if (current !== null && current !== undefined) {
        if (typeof current === 'string') return current;
        if (typeof current === 'number' || typeof current === 'boolean') {
          return String(current);
        }
        return null; // Avoid stringifying objects
      }
    } else if (key in obj && obj[key] !== null && obj[key] !== undefined) {
      const value = obj[key];
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      return null; // Avoid stringifying objects
    }
  }
  return null;
}

// Helper to safely get numeric value from object
export function getNumericField(
  obj: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current: unknown = obj;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          current = null;
          break;
        }
      }
      if (current !== null && current !== undefined) {
        if (typeof current === 'number') return current;
        if (typeof current === 'string') {
          const num = parseFloat(current);
          if (!isNaN(num)) return num;
        }
        return null;
      }
    } else if (key in obj && obj[key] !== null && obj[key] !== undefined) {
      const value = obj[key];
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const num = parseFloat(value);
        if (!isNaN(num)) return num;
      }
      return null;
    }
  }
  return null;
}
