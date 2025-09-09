"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractRequestSchema = exports.InvoiceRecordSchema = exports.InvoiceSchema = exports.VendorSchema = exports.LineItemSchema = void 0;
const zod_1 = require("zod");
exports.LineItemSchema = zod_1.z.object({
    description: zod_1.z.string(),
    unitPrice: zod_1.z.number(),
    quantity: zod_1.z.number(),
    total: zod_1.z.number(),
});
exports.VendorSchema = zod_1.z.object({
    name: zod_1.z.string(),
    address: zod_1.z.string().optional(),
    taxId: zod_1.z.string().optional(),
});
exports.InvoiceSchema = zod_1.z.object({
    number: zod_1.z.string(),
    date: zod_1.z.string(),
    currency: zod_1.z.string().optional(),
    subtotal: zod_1.z.number().optional(),
    taxPercent: zod_1.z.number().optional(),
    total: zod_1.z.number().optional(),
    poNumber: zod_1.z.string().optional(),
    poDate: zod_1.z.string().optional(),
    lineItems: zod_1.z.array(exports.LineItemSchema),
});
exports.InvoiceRecordSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    fileId: zod_1.z.string(),
    fileName: zod_1.z.string(),
    vendor: exports.VendorSchema,
    invoice: exports.InvoiceSchema,
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string().optional(),
});
exports.ExtractRequestSchema = zod_1.z.object({
    fileId: zod_1.z.string(),
    model: zod_1.z.enum(['gemini', 'groq']),
});
//# sourceMappingURL=index.js.map