import { z } from 'zod';

export const LineItemSchema = z.object({
  description: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  total: z.number(),
});

export const VendorSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export const InvoiceSchema = z.object({
  number: z.string(),
  date: z.string(),
  currency: z.string().optional(),
  subtotal: z.number().optional(),
  taxPercent: z.number().optional(),
  total: z.number().optional(),
  poNumber: z.string().optional(),
  poDate: z.string().optional(),
  lineItems: z.array(LineItemSchema),
});

export const InvoiceRecordSchema = z.object({
  _id: z.string().optional(),
  fileId: z.string(),
  fileName: z.string(),
  vendor: VendorSchema,
  invoice: InvoiceSchema,
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type LineItem = z.infer<typeof LineItemSchema>;
export type Vendor = z.infer<typeof VendorSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceRecord = z.infer<typeof InvoiceRecordSchema>;

export const ExtractRequestSchema = z.object({
  fileId: z.string(),
  model: z.enum(['gemini', 'groq']),
});

export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;