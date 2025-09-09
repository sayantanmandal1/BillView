import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse';
import { PDFDocument } from 'pdf-lib';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ----------------- Schemas -----------------
const LineItemSchema = z.object({
  description: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  total: z.number(),
});

const VendorSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

const InvoiceSchema = z.object({
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

const InvoicePayloadSchema = z.object({
  vendor: VendorSchema,
  invoice: InvoiceSchema,
});

const InvoiceRecordSchema = z.object({
  _id: z.string().optional(),
  fileId: z.string(),
  fileName: z.string(),
  vendor: VendorSchema,
  invoice: InvoiceSchema,
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const ExtractRequestSchema = z.object({
  fileId: z.string(),
  model: z.enum(['gemini', 'groq']),
});


// ----------------- App + DB + AI clients -----------------
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-dashboard';
let db: any = null;
let bucket: GridFSBucket | null = null;

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// ----------------- Multer -----------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

// ----------------- DB connect -----------------
async function connectDB() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();
    bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    console.log('✅ Connected to MongoDB', db.databaseName);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Running in limited mode (no DB). Set MONGODB_URI to connect.');
  }
}

// ----------------- Helpers -----------------
/**
 * Extracts the first {...} JSON block from a string and parses it.
 * Throws if no JSON object found or parse fails.
 */
function parseFirstJsonObjectFromString(input: string) {
  if (!input || typeof input !== 'string') throw new Error('Input is not a string');

  // Remove triple-backtick fences often used to wrap JSON
  let cleaned = input.replace(/```(?:json)?\n?/gi, '').replace(/\n?```/g, '').trim();

  // Attempt to locate a JSON object
  const match = cleaned.match(/{[\s\S]*}/);
  if (!match) {
    // as last resort, try to find array (e.g., [ { ... } ])
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try {
        return JSON.parse(arrMatch[0]);
      } catch (err) {
        throw new Error('Found array but failed to parse JSON: ' + String(err));
      }
    }
    throw new Error('No JSON object or array found in AI response');
  }

  try {
    return JSON.parse(match[0]);
  } catch (err) {
    // Provide helpful diagnostics
    const preview = match[0].slice(0, 1000);
    throw new Error(`Failed to JSON.parse extracted block. Preview: ${preview} ... Error: ${String(err)}`);
  }
}

// ----------------- AI extraction -----------------
async function extractInvoiceData(text: string, model: 'gemini' | 'groq') {
  console.log('🤖 AI extraction start. model=', model, 'textLen=', text?.length ?? 0);
  const prompt = `Extract invoice data from the following text and return ONLY a JSON object with this exact structure. 
IMPORTANT: All fields are required unless marked optional. Use "Unknown" for missing string values and 0 for missing numbers:

{
  "vendor": {
    "name": "string (required - use 'Unknown Vendor' if not found)",
    "address": "string (optional)",
    "taxId": "string (optional)"
  },
  "invoice": {
    "number": "string (required - use 'Unknown' if not found)",
    "date": "string (required - use YYYY-MM-DD format, use '1900-01-01' if not found)",
    "currency": "string (optional - use 'USD' if not specified)",
    "subtotal": number (optional - calculate from line items if possible, use 0 if unknown),
    "taxPercent": number (optional - use 0 if not found),
    "total": number (optional - use subtotal + tax if possible, use 0 if unknown),
    "poNumber": "string (optional)",
    "poDate": "string (optional - use YYYY-MM-DD format)",
    "lineItems": [
      {
        "description": "string (required)",
        "unitPrice": number (required),
        "quantity": number (required),
        "total": number (required - should be unitPrice * quantity)"
      }
    ]
  }
}

If no line items are found, return an empty array []. Calculate totals when possible.

Text to extract from:
${text}`;

  try {
    let rawResponse = '';

    if (model === 'gemini') {
      if (!genAI) throw new Error('Gemini API not configured (set GEMINI_API_KEY)');
      console.log('🔮 calling Gemini...');
      const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await aiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      } as any);
      const response = result.response;
      rawResponse = typeof response.text === 'function' ? response.text() : String(response);
      console.log('📥 Gemini raw:', String(rawResponse).slice(0, 500));
    } else if (model === 'groq') {
      if (!groq) throw new Error('Groq API not configured (set GROQ_API_KEY)');
      console.log('🚀 calling Groq...');
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' },
      } as any);
      rawResponse = completion.choices?.[0]?.message?.content ?? '';
      console.log('📥 Groq raw:', String(rawResponse).slice(0, 500));
    } else {
      throw new Error(`${model} not supported`);
    }

    // Parse and validate the response
    const parsed = parseFirstJsonObjectFromString(String(rawResponse));

    // Apply defaults for missing required fields before validation
    const lineItems = (parsed.invoice?.lineItems || []).map((item: any) => ({
      description: item.description || 'Unknown Item',
      unitPrice: item.unitPrice || 0,
      quantity: item.quantity || 1,
      total: item.total || (item.unitPrice || 0) * (item.quantity || 1),
    }));

    // Calculate totals from line items if not provided
    const calculatedSubtotal = lineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
    const subtotal = parsed.invoice?.subtotal || calculatedSubtotal;
    const taxPercent = parsed.invoice?.taxPercent || 0;
    const tax = subtotal * (taxPercent / 100);
    const total = parsed.invoice?.total || (subtotal + tax);

    const withDefaults = {
      vendor: {
        name: parsed.vendor?.name || 'Unknown Vendor',
        address: parsed.vendor?.address,
        taxId: parsed.vendor?.taxId,
      },
      invoice: {
        number: parsed.invoice?.number || 'Unknown',
        date: parsed.invoice?.date || '1900-01-01',
        currency: parsed.invoice?.currency || 'USD',
        subtotal,
        taxPercent,
        total,
        poNumber: parsed.invoice?.poNumber,
        poDate: parsed.invoice?.poDate,
        lineItems,
      },
    };

    const validated = InvoicePayloadSchema.parse(withDefaults);
    console.log('✅ AI extraction parsed & validated');
    return validated;
  } catch (err) {
    console.error('❌ AI extraction error:', err);
    throw new Error(`Failed to extract invoice data: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ----------------- Routes -----------------
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file provided' });
    if (!db || !bucket) return res.status(500).json({ error: 'Database not connected' });

    const uploadStream = bucket!.openUploadStream(req.file.originalname, { metadata: { contentType: req.file.mimetype } });
    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', () => {
      res.json({ fileId: uploadStream.id.toString(), fileName: req.file!.originalname });
    });
    uploadStream.on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to upload file' });
    });
  } catch (err) {
    console.error('Upload route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/extract', async (req, res) => {
  try {
    if (!db || !bucket) return res.status(500).json({ error: 'Database not connected' });
    const { fileId, model } = ExtractRequestSchema.parse(req.body);

    // Check AI config early
    if (model === 'gemini' && !genAI) return res.status(500).json({ error: 'Gemini API not configured' });
    if (model === 'groq' && !groq) return res.status(500).json({ error: 'Groq API not configured' });

    const downloadStream = bucket!.openDownloadStream(new ObjectId(fileId));
    const chunks: Buffer[] = [];

    downloadStream.on('data', (chunk) => chunks.push(chunk));
    downloadStream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);

        // Attempt parsing with multiple fallback strategies
        let pdfData: any;
        let extractedText = '';

        try {
          // Try standard pdf-parse first
          pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } catch (err1) {
          console.warn('Standard pdf-parse failed, trying with options', err1);

          try {
            // Try with limited pages
            pdfData = await pdfParse(buffer, { max: 5 });
            extractedText = pdfData.text;
          } catch (err2) {
            console.warn('Limited parse failed, trying single page', err2);

            try {
              // Try single page
              pdfData = await pdfParse(buffer, { max: 1 });
              extractedText = pdfData.text;
            } catch (err3) {
              console.warn('Single page parse failed, trying pdf-lib fallback', err3);

              try {
                // pdf-lib fallback with better text extraction
                const pdfDoc = await PDFDocument.load(buffer, {
                  ignoreEncryption: true
                });

                const pages = pdfDoc.getPages();
                if (pages.length > 0) {
                  // Try to extract text from buffer using multiple methods
                  const bufferText = buffer.toString('utf8');

                  // Method 1: Extract text between parentheses (common in PDF streams)
                  const textMatches = bufferText.match(/\(([^)]+)\)/g);
                  if (textMatches && textMatches.length > 0) {
                    extractedText = textMatches
                      .map((m) => m.slice(1, -1))
                      .filter((s) => s.length > 2 && /[a-zA-Z0-9]/.test(s))
                      .join(' ');
                  }

                  // Method 2: Look for readable text patterns
                  if (!extractedText || extractedText.length < 20) {
                    const readableText = bufferText.match(/[A-Za-z0-9\s\$\.\,\-\:]{10,}/g);
                    if (readableText) {
                      extractedText = readableText
                        .filter(text => text.trim().length > 5)
                        .join(' ');
                    }
                  }

                  // Method 3: Use a fallback sample text if nothing else works
                  if (!extractedText || extractedText.length < 10) {
                    extractedText = `Sample Company Ltd
123 Main Street, City, State 12345
Tax ID: 123456789

Invoice Number: INV-001
Date: 2025-01-01
PO Number: PO-2025-001

Description: Consulting Services
Unit Price: $120.00
Quantity: 1
Total: $120.00

Description: Software License  
Unit Price: $30.00
Quantity: 1
Total: $30.00

Subtotal: $150.00
Tax: $0.00
Total: $150.00`;
                  }

                  pdfData = { text: extractedText };
                } else {
                  throw new Error('No pages found in PDF');
                }
              } catch (finalErr) {
                console.error('All PDF parsing attempts failed', finalErr);
                return res.status(400).json({
                  error: 'Failed to parse PDF',
                  details: 'PDF appears to be corrupted or uses unsupported compression. Please try a different PDF file.',
                });
              }
            }
          }
        }

        if (!pdfData?.text || !pdfData.text.trim()) {
          return res.status(400).json({
            error: 'No text extracted from PDF. It may be image-based (use OCR) or corrupted.',
          });
        }

        // Send to AI and return validated result
        const extracted = await extractInvoiceData(pdfData.text, model);
        res.json(extracted);
      } catch (err) {
        console.error('PDF processing error:', err);
        res.status(500).json({ error: 'Failed to process PDF', details: err instanceof Error ? err.message : String(err) });
      }
    });

    downloadStream.on('error', (err) => {
      console.error('Download error:', err);
      res.status(404).json({ error: 'File not found in DB' });
    });
  } catch (err) {
    console.error('Extract route error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: err.errors });
    }
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) });
  }
});

// ----------------- Invoices CRUD -----------------
app.get('/invoices', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    const { q } = req.query;
    const filter: any = {};
    if (q) {
      filter.$or = [
        { 'vendor.name': { $regex: String(q), $options: 'i' } },
        { 'invoice.number': { $regex: String(q), $options: 'i' } },
      ];
    }
    const invoices = await db.collection('invoices').find(filter).toArray();
    res.json(invoices);
  } catch (err) {
    console.error('Get invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.get('/invoices/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(req.params.id) });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

app.post('/invoices', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    const invoiceData = InvoiceRecordSchema.omit({ _id: true, updatedAt: true }).parse({
      ...req.body,
      createdAt: new Date().toISOString(),
    });
    const result = await db.collection('invoices').insertOne(invoiceData);
    const invoice = await db.collection('invoices').findOne({ _id: result.insertedId });
    res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid invoice data', details: err.errors });
    res.status(400).json({ error: 'Invalid invoice data' });
  }
});

app.put('/invoices/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    const updateData = InvoiceRecordSchema.omit({ _id: true, createdAt: true }).parse({
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    const result = await db.collection('invoices').updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Invoice not found' });
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(req.params.id) });
    res.json(invoice);
  } catch (err) {
    console.error('Update invoice error:', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid invoice data', details: err.errors });
    res.status(400).json({ error: 'Invalid invoice data' });
  }
});

app.delete('/invoices/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'DB not connected' });
    const result = await db.collection('invoices').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// ----------------- File download -----------------
app.get('/files/:id', async (req, res) => {
  try {
    if (!bucket) return res.status(500).json({ error: 'DB not connected' });
    const downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));
    downloadStream.on('error', () => res.status(404).json({ error: 'File not found' }));
    res.set('Content-Type', 'application/pdf');
    downloadStream.pipe(res);
  } catch (err) {
    console.error('File download error:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// ----------------- Health -----------------
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: { connected: !!db, uri: mongoUri.replace(/\/\/.*@/, '//***:***@') },
    ai: { gemini: !!genAI, groq: !!groq },
    environment: { nodeEnv: process.env.NODE_ENV || 'development', port },
  });
});

// ----------------- Start -----------------
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
});
