'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFViewer } from '@/components/pdf-viewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import type { InvoiceRecord } from '@/lib/types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Invoice Details</h1>
          </div>
          
          <Link href={`/invoices/${invoice._id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - PDF Viewer */}
        <div className="w-1/2 border-r bg-white">
          <PDFViewer fileUrl={`${API_BASE}/files/${invoice.fileId}`} />
        </div>

        {/* Right Panel - Invoice Details */}
        <div className="w-1/2 bg-white overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Vendor Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Name:</strong> {invoice.vendor.name}</div>
                {invoice.vendor.address && (
                  <div><strong>Address:</strong> {invoice.vendor.address}</div>
                )}
                {invoice.vendor.taxId && (
                  <div><strong>Tax ID:</strong> {invoice.vendor.taxId}</div>
                )}
              </div>
            </div>

            {/* Invoice Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Number:</strong> {invoice.invoice.number}</div>
                <div><strong>Date:</strong> {new Date(invoice.invoice.date).toLocaleDateString()}</div>
                {invoice.invoice.currency && (
                  <div><strong>Currency:</strong> {invoice.invoice.currency}</div>
                )}
                {invoice.invoice.subtotal && (
                  <div><strong>Subtotal:</strong> {invoice.invoice.subtotal.toFixed(2)}</div>
                )}
                {invoice.invoice.taxPercent && (
                  <div><strong>Tax:</strong> {invoice.invoice.taxPercent}%</div>
                )}
                {invoice.invoice.total && (
                  <div><strong>Total:</strong> {invoice.invoice.total.toFixed(2)}</div>
                )}
                {invoice.invoice.poNumber && (
                  <div><strong>PO Number:</strong> {invoice.invoice.poNumber}</div>
                )}
                {invoice.invoice.poDate && (
                  <div><strong>PO Date:</strong> {new Date(invoice.invoice.poDate).toLocaleDateString()}</div>
                )}
              </div>
            </div>

            {/* Line Items */}
            {invoice.invoice.lineItems && invoice.invoice.lineItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Unit Price</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.invoice.lineItems.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.description}</td>
                          <td className="text-right py-2">{item.unitPrice.toFixed(2)}</td>
                          <td className="text-right py-2">{item.quantity}</td>
                          <td className="text-right py-2">{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Metadata</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>File:</strong> {invoice.fileName}</div>
                <div><strong>Created:</strong> {new Date(invoice.createdAt).toLocaleString()}</div>
                {invoice.updatedAt && (
                  <div><strong>Updated:</strong> {new Date(invoice.updatedAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}