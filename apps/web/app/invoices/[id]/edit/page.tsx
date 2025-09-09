'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFViewer } from '@/components/pdf-viewer';
import { InvoiceForm } from '@/components/invoice-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { InvoiceRecord } from '@/lib/types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`${API_BASE}/invoices/${params.id}`);
        if (!response.ok) throw new Error('Invoice not found');
        
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to load invoice');
        router.push('/invoices');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id, router]);

  const handleSave = async (data: Partial<InvoiceRecord>) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Update failed');

      const updated = await response.json();
      setInvoice(updated);
      alert('Invoice updated successfully!');
      router.push(`/invoices/${params.id}`);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`${API_BASE}/invoices/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      
      alert('Invoice deleted successfully!');
      router.push('/invoices');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete invoice');
    }
  };

  const handleExtract = async (model: 'gemini' | 'groq') => {
    if (!invoice) return;

    try {
      const response = await fetch(`${API_BASE}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: invoice.fileId, model }),
      });

      if (!response.ok) throw new Error('Extraction failed');

      const extracted = await response.json();
      return {
        ...invoice,
        ...extracted,
      };
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Failed to extract data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href={`/invoices/${invoice._id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Invoice</h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - PDF Viewer */}
        <div className="w-1/2 border-r bg-white">
          <PDFViewer fileUrl={`${API_BASE}/files/${invoice.fileId}`} />
        </div>

        {/* Right Panel - Invoice Form */}
        <div className="w-1/2 bg-white overflow-y-auto">
          <InvoiceForm
            data={invoice}
            onSave={handleSave}
            onExtract={handleExtract}
            onDelete={handleDelete}
            loading={saving}
          />
        </div>
      </div>
    </div>
  );
}