import { z } from 'zod';
export declare const LineItemSchema: z.ZodObject<{
    description: z.ZodString;
    unitPrice: z.ZodNumber;
    quantity: z.ZodNumber;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    description: string;
    unitPrice: number;
    quantity: number;
    total: number;
}, {
    description: string;
    unitPrice: number;
    quantity: number;
    total: number;
}>;
export declare const VendorSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address?: string | undefined;
    taxId?: string | undefined;
}, {
    name: string;
    address?: string | undefined;
    taxId?: string | undefined;
}>;
export declare const InvoiceSchema: z.ZodObject<{
    number: z.ZodString;
    date: z.ZodString;
    currency: z.ZodOptional<z.ZodString>;
    subtotal: z.ZodOptional<z.ZodNumber>;
    taxPercent: z.ZodOptional<z.ZodNumber>;
    total: z.ZodOptional<z.ZodNumber>;
    poNumber: z.ZodOptional<z.ZodString>;
    poDate: z.ZodOptional<z.ZodString>;
    lineItems: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        unitPrice: z.ZodNumber;
        quantity: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }, {
        description: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    number: string;
    date: string;
    lineItems: {
        description: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }[];
    total?: number | undefined;
    currency?: string | undefined;
    subtotal?: number | undefined;
    taxPercent?: number | undefined;
    poNumber?: string | undefined;
    poDate?: string | undefined;
}, {
    number: string;
    date: string;
    lineItems: {
        description: string;
        unitPrice: number;
        quantity: number;
        total: number;
    }[];
    total?: number | undefined;
    currency?: string | undefined;
    subtotal?: number | undefined;
    taxPercent?: number | undefined;
    poNumber?: string | undefined;
    poDate?: string | undefined;
}>;
export declare const InvoiceRecordSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    fileId: z.ZodString;
    fileName: z.ZodString;
    vendor: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        taxId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        address?: string | undefined;
        taxId?: string | undefined;
    }, {
        name: string;
        address?: string | undefined;
        taxId?: string | undefined;
    }>;
    invoice: z.ZodObject<{
        number: z.ZodString;
        date: z.ZodString;
        currency: z.ZodOptional<z.ZodString>;
        subtotal: z.ZodOptional<z.ZodNumber>;
        taxPercent: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
        poNumber: z.ZodOptional<z.ZodString>;
        poDate: z.ZodOptional<z.ZodString>;
        lineItems: z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            unitPrice: z.ZodNumber;
            quantity: z.ZodNumber;
            total: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }, {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        number: string;
        date: string;
        lineItems: {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }[];
        total?: number | undefined;
        currency?: string | undefined;
        subtotal?: number | undefined;
        taxPercent?: number | undefined;
        poNumber?: string | undefined;
        poDate?: string | undefined;
    }, {
        number: string;
        date: string;
        lineItems: {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }[];
        total?: number | undefined;
        currency?: string | undefined;
        subtotal?: number | undefined;
        taxPercent?: number | undefined;
        poNumber?: string | undefined;
        poDate?: string | undefined;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fileId: string;
    fileName: string;
    vendor: {
        name: string;
        address?: string | undefined;
        taxId?: string | undefined;
    };
    invoice: {
        number: string;
        date: string;
        lineItems: {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }[];
        total?: number | undefined;
        currency?: string | undefined;
        subtotal?: number | undefined;
        taxPercent?: number | undefined;
        poNumber?: string | undefined;
        poDate?: string | undefined;
    };
    createdAt: string;
    _id?: string | undefined;
    updatedAt?: string | undefined;
}, {
    fileId: string;
    fileName: string;
    vendor: {
        name: string;
        address?: string | undefined;
        taxId?: string | undefined;
    };
    invoice: {
        number: string;
        date: string;
        lineItems: {
            description: string;
            unitPrice: number;
            quantity: number;
            total: number;
        }[];
        total?: number | undefined;
        currency?: string | undefined;
        subtotal?: number | undefined;
        taxPercent?: number | undefined;
        poNumber?: string | undefined;
        poDate?: string | undefined;
    };
    createdAt: string;
    _id?: string | undefined;
    updatedAt?: string | undefined;
}>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type Vendor = z.infer<typeof VendorSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceRecord = z.infer<typeof InvoiceRecordSchema>;
export declare const ExtractRequestSchema: z.ZodObject<{
    fileId: z.ZodString;
    model: z.ZodEnum<["gemini", "groq"]>;
}, "strip", z.ZodTypeAny, {
    fileId: string;
    model: "gemini" | "groq";
}, {
    fileId: string;
    model: "gemini" | "groq";
}>;
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;
//# sourceMappingURL=index.d.ts.map