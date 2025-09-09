# PDF Review Dashboard

A comprehensive PDF invoice processing dashboard with AI-powered data extraction using Gemini and Groq APIs. Built with Next.js, Node.js, and MongoDB in a monorepo structure.

## 🚀 Features

- **PDF Upload & Viewing**: Upload PDFs up to 25MB and view them with zoom and navigation controls
- **AI Data Extraction**: Extract invoice data using Gemini or Groq AI models
- **Data Management**: Full CRUD operations for invoice records stored in MongoDB
- **Search & Filter**: Search invoices by vendor name or invoice number
- **Responsive UI**: Clean interface built with shadcn/ui components

## 🏗️ Architecture

```
pdf-review-dashboard/
├── apps/
│   ├── web/          # Next.js frontend (App Router + TypeScript)
│   └── api/          # Node.js backend API
├── packages/
│   └── types/        # Shared TypeScript types
└── package.json      # Monorepo configuration
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, PDF.js
- **Backend**: Node.js, Express, TypeScript, MongoDB, GridFS
- **AI**: Google Gemini API, Groq API
- **Deployment**: Vercel (both frontend and API)

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB instance
- Gemini API key (Google AI Studio) or Groq API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd pdf-review-dashboard
npm install
```

### 2. Environment Setup

**Backend (.env in apps/api/):**
```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-dashboard
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

**Frontend (.env.local in apps/web/):**
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run Development Servers

**Option A: Use the batch script (Windows):**
```bash
start-dev.bat
```

**Option B: Manual start:**
```bash
# Terminal 1 - Start API server
cd apps/api
npm run dev

# Terminal 2 - Start web server  
cd apps/web
npm run dev
```

**Option C: Using npm workspaces (from root):**
```bash
npm run dev --workspace=api
npm run dev --workspace=web
```

### 4. Build for Production

```bash
npm run build
```

## 🔑 API Keys Setup

### Gemini API (Google AI Studio)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `GEMINI_API_KEY` in your `.env` file

### Groq API
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Add to `GROQ_API_KEY` in your `.env` file

## 📡 API Endpoints

### File Operations
- `POST /upload` - Upload PDF file
- `GET /files/:id` - Download PDF file

### AI Extraction
- `POST /extract` - Extract invoice data with AI
  ```json
  {
    "fileId": "string",
    "model": "gemini" | "groq"
  }
  ```

### Invoice CRUD
- `GET /invoices` - List invoices (supports `?q=search` query)
- `GET /invoices/:id` - Get single invoice
- `POST /invoices` - Create new invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

### Sample Request/Response

**POST /invoices**
```json
{
  "fileId": "507f1f77bcf86cd799439011",
  "fileName": "invoice.pdf",
  "vendor": {
    "name": "Acme Corp",
    "address": "123 Main St, City, State 12345",
    "taxId": "12-3456789"
  },
  "invoice": {
    "number": "INV-001",
    "date": "2024-01-15",
    "currency": "USD",
    "subtotal": 100.00,
    "taxPercent": 8.5,
    "total": 108.50,
    "lineItems": [
      {
        "description": "Product A",
        "unitPrice": 50.00,
        "quantity": 2,
        "total": 100.00
      }
    ]
  }
}
```

## 🚀 Deployment

### Vercel Deployment

1. **Deploy API:**
   ```bash
   cd apps/api
   vercel --prod
   ```

2. **Deploy Frontend:**
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Update Environment Variables:**
   - Set production MongoDB URI in Vercel dashboard
   - Set API keys (GEMINI_API_KEY, GROQ_API_KEY)
   - Update NEXT_PUBLIC_API_URL to your deployed API URL

### Environment Variables for Production

**API (apps/api):**
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `GROQ_API_KEY` - Groq API key

**Web (apps/web):**
- `NEXT_PUBLIC_API_URL` - Your deployed API URL

## 🧪 Usage Flow

1. **Upload PDF**: Click "Upload PDF" and select an invoice file
2. **View PDF**: The PDF renders in the left panel with zoom/navigation controls
3. **Extract Data**: Choose "Gemini" or "Groq" from the dropdown to extract invoice data
4. **Edit Data**: Modify any extracted fields in the right panel form
5. **Save Invoice**: Click "Save" to store the invoice in MongoDB
6. **Manage Invoices**: Use "View Invoices" to see all saved invoices
7. **Search**: Use the search bar to find invoices by vendor or number
8. **CRUD Operations**: View, edit, or delete individual invoices

## 🔧 Development

### Project Structure
- `apps/web/` - Next.js frontend application
- `apps/api/` - Express.js backend API
- `packages/types/` - Shared TypeScript type definitions

### Key Components
- `PDFViewer` - PDF.js-based PDF rendering component
- `InvoiceForm` - Editable form for invoice data
- `InvoiceList` - Table view of all invoices with search

### Database Schema
```typescript
interface InvoiceRecord {
  _id?: string;
  fileId: string;
  fileName: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: Array<{
      description: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;
  };
  createdAt: string;
  updatedAt?: string;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **500 Error on Extract/Upload**: This usually means MongoDB isn't connected:
   ```bash
   # Check API status
   curl http://localhost:3001/health
   
   # Or run the test script
   node test-api.js
   ```
   **Solutions:**
   - Set up MongoDB Atlas (free): See `setup-mongodb.md`
   - Install MongoDB locally
   - Check your `MONGODB_URI` in `apps/api/.env`

2. **PDF.js Worker Error**: If you see "Failed to load PDF worker" errors:
   - The app automatically copies the PDF worker file to `/public/pdf.worker.min.mjs`
   - If issues persist, manually run: `npm run copy-pdf-worker` in the web directory
   - Check that `public/pdf.worker.min.mjs` exists

3. **AI extraction fails**: 
   - Verify API keys are set correctly in `apps/api/.env`
   - Check the health endpoint to see which AI services are configured
   - Make sure you have either `GEMINI_API_KEY` or `GROQ_API_KEY` set

4. **MongoDB connection issues**: 
   - Check connection string format and network access
   - Use the health endpoint: `GET http://localhost:3001/health`
   - See `setup-mongodb.md` for detailed setup instructions

5. **CORS errors**: Ensure API URL is correctly set in frontend environment

### Development Tips

- Use MongoDB Compass to inspect your database
- Check browser console for frontend errors
- Monitor API logs for backend issues
- Test with sample invoice PDFs first
- Use the health endpoint to verify API configuration: `curl http://localhost:3001/health`

### PDF.js Setup

The application uses PDF.js for in-browser PDF rendering. The worker file is automatically copied during development and build processes. If you encounter issues:

1. Ensure the worker file exists: `apps/web/public/pdf.worker.min.mjs`
2. Check browser console for worker-related errors
3. Try refreshing the page after uploading a PDF

## 📄 License

MIT License - see LICENSE file for details