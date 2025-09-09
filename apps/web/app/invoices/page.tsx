'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { InvoiceRecord } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async (query = '') => {
    try {
      const url = query 
        ? `${API_BASE}/invoices?q=${encodeURIComponent(query)}`
        : `${API_BASE}/invoices`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`${API_BASE}/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      
      setInvoices(invoices.filter(inv => inv._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete invoice');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices(searchQuery);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Invoice List</h1>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
              placeholder="Search by vendor or invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No invoices found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.vendor.name}
                        </div>
                        {invoice.vendor.address && (
                          <div className="text-sm text-gray-500">
                            {invoice.vendor.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.invoice.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.invoice.currency} {invoice.invoice.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link href={`/invoices/${invoice._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/invoices/${invoice._id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(invoice._id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}