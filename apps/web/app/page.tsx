'use client';

import { useState, useRef } from 'react';
import { PDFViewer } from '@/components/pdf-viewer';
import { InvoiceForm } from '@/components/invoice-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import type { InvoiceRecord } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<{ id: string; name: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<Partial<InvoiceRecord> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📤 Starting upload:', { name: file.name, size: file.size, type: file.type });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('📥 Upload response:', result);

      if (!response.ok) {
        throw new Error(`Upload failed: ${result.error || 'Unknown error'}`);
      }

      setCurrentFile({ id: result.fileId, name: result.fileName });
      setPdfUrl(`${API_BASE}/files/${result.fileId}`);
      setInvoiceData(null);
      
      console.log('✅ Upload successful, fileId:', result.fileId);
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleExtract = async (model: 'gemini' | 'groq') => {
    if (!currentFile) return;

    setExtracting(true);
    try {
      console.log('🔍 Starting extraction with:', { fileId: currentFile.id, model });
      
      const response = await fetch(`${API_BASE}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: currentFile.id, model }),
      });

      const responseData = await response.json();
      console.log('📥 API Response:', responseData);

      if (!response.ok) {
        throw new Error(`Extraction failed: ${responseData.error || 'Unknown error'}`);
      }

      setInvoiceData({
        fileId: currentFile.id,
        fileName: currentFile.name,
        ...responseData,
      });
      
      console.log('✅ Extraction successful');
    } catch (error) {
      console.error('❌ Extraction error:', error);
      alert(`Failed to extract data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async (data: Partial<InvoiceRecord>) => {
    if (!currentFile) {
      alert('No file uploaded');
      return;
    }

    setSaving(true);
    try {
      const saveData = {
        ...data,
        fileId: currentFile.id,
        fileName: currentFile.name,
      };

      console.log('💾 Saving invoice data:', saveData);

      const response = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Save failed:', errorData);
        throw new Error(`Save failed: ${errorData.error || 'Unknown error'}`);
      }

      const saved = await response.json();
      setInvoiceData(saved);
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">PDF Review Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link href="/invoices">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
            </Link>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - PDF Viewer */}
        <div className="w-1/2 border-r bg-white">
          <PDFViewer fileUrl={pdfUrl} />
        </div>

        {/* Right Panel - Invoice Form */}
        <div className="w-1/2 bg-white overflow-y-auto">
          <InvoiceForm
            data={invoiceData}
            onSave={handleSave}
            onExtract={handleExtract}
            loading={saving}
            extracting={extracting}
          />
        </div>
      </div>
    </div>
  );
}