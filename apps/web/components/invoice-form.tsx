'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Save, Loader2 } from 'lucide-react';
import type { InvoiceRecord, LineItem } from '@/lib/types';

interface InvoiceFormProps {
  data: Partial<InvoiceRecord> | null;
  onSave: (data: Partial<InvoiceRecord>) => Promise<void>;
  onExtract: (model: 'gemini' | 'groq') => Promise<Partial<InvoiceRecord> | void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  extracting?: boolean;
}

export function InvoiceForm({
  data,
  onSave,
  onExtract,
  onDelete,
  loading = false,
  extracting = false
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<Partial<InvoiceRecord>>({
    vendor: { name: '', address: '', taxId: '' },
    invoice: {
      number: '',
      date: '',
      currency: 'USD',
      subtotal: 0,
      taxPercent: 0,
      total: 0,
      poNumber: '',
      poDate: '',
      lineItems: []
    }
  });

  // Update form data when new data is received
  useEffect(() => {
    if (data) {
      console.log('📝 Updating form with new data:', data);

      const newFormData = {
        fileId: data.fileId,
        fileName: data.fileName,
        vendor: {
          name: data.vendor?.name || '',
          address: data.vendor?.address || '',
          taxId: data.vendor?.taxId || '',
        },
        invoice: {
          number: data.invoice?.number || '',
          date: data.invoice?.date || '',
          currency: data.invoice?.currency || 'USD',
          subtotal: Number(data.invoice?.subtotal) || 0,
          taxPercent: Number(data.invoice?.taxPercent) || 0,
          total: Number(data.invoice?.total) || 0,
          poNumber: data.invoice?.poNumber || '',
          poDate: data.invoice?.poDate || '',
          lineItems: data.invoice?.lineItems?.map(item => ({
            description: item.description || '',
            unitPrice: Number(item.unitPrice) || 0,
            quantity: Number(item.quantity) || 1,
            total: Number(item.total) || 0,
          })) || [],
        }
      };

      console.log('📝 Setting form data to:', newFormData);
      setFormData(newFormData);
    }
  }, [data]);

  const updateVendor = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vendor: {
        name: prev.vendor?.name || '',
        address: prev.vendor?.address || '',
        taxId: prev.vendor?.taxId || '',
        ...prev.vendor,
        [field]: value
      }
    }));
  };

  const updateInvoice = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      invoice: {
        number: prev.invoice?.number || '',
        date: prev.invoice?.date || '',
        lineItems: prev.invoice?.lineItems || [],
        ...prev.invoice,
        [field]: value
      }
    }));
  };

  const updateLineItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const lineItems = [...(prev.invoice?.lineItems || [])];
      const currentItem = lineItems[index] || { description: '', unitPrice: 0, quantity: 1, total: 0 };
      lineItems[index] = {
        ...currentItem,
        [field]: value
      };
      return {
        ...prev,
        invoice: {
          number: prev.invoice?.number || '',
          date: prev.invoice?.date || '',
          lineItems: lineItems,
          ...prev.invoice
        }
      };
    });
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      invoice: {
        number: prev.invoice?.number || '',
        date: prev.invoice?.date || '',
        lineItems: [
          ...(prev.invoice?.lineItems || []),
          { description: '', unitPrice: 0, quantity: 1, total: 0 }
        ],
        ...prev.invoice
      }
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      invoice: {
        number: prev.invoice?.number || '',
        date: prev.invoice?.date || '',
        lineItems: prev.invoice?.lineItems?.filter((_, i) => i !== index) || [],
        ...prev.invoice
      }
    }));
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  const handleExtract = async (model: 'gemini' | 'groq') => {
    await onExtract(model);
    // Form data will be updated via useEffect when parent component updates the data prop
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoice Data</h2>
        <div className="flex space-x-2">
          <Select onValueChange={(value) => handleExtract(value as 'gemini' | 'groq')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Extract with AI" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="groq">Groq</SelectItem>
            </SelectContent>
          </Select>
          {extracting && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded text-xs">
          <strong>Debug Info:</strong>
          <br />Vendor Name: {formData.vendor?.name || 'empty'}
          <br />Invoice Number: {formData.invoice?.number || 'empty'}
          <br />Invoice Date: {formData.invoice?.date || 'empty'}
          <br />Line Items: {formData.invoice?.lineItems?.length || 0}
        </div>
      )}

      {/* Vendor Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vendor Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="vendor-name">Name</Label>
            <Input
              id="vendor-name"
              value={formData.vendor?.name || ''}
              onChange={(e) => updateVendor('name', e.target.value)}
              placeholder="Vendor name"
            />
          </div>
          <div>
            <Label htmlFor="vendor-address">Address</Label>
            <Input
              id="vendor-address"
              value={formData.vendor?.address || ''}
              onChange={(e) => updateVendor('address', e.target.value)}
              placeholder="Vendor address"
            />
          </div>
          <div>
            <Label htmlFor="vendor-tax-id">Tax ID</Label>
            <Input
              id="vendor-tax-id"
              value={formData.vendor?.taxId || ''}
              onChange={(e) => updateVendor('taxId', e.target.value)}
              placeholder="Tax ID"
            />
          </div>
        </div>
      </div>

      {/* Invoice Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Invoice Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              value={formData.invoice?.number || ''}
              onChange={(e) => updateInvoice('number', e.target.value)}
              placeholder="Invoice number"
            />
          </div>
          <div>
            <Label htmlFor="invoice-date">Date</Label>
            <Input
              id="invoice-date"
              type="date"
              value={formData.invoice?.date || ''}
              onChange={(e) => updateInvoice('date', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={formData.invoice?.currency || ''}
              onChange={(e) => updateInvoice('currency', e.target.value)}
              placeholder="USD"
            />
          </div>
          <div>
            <Label htmlFor="tax-percent">Tax %</Label>
            <Input
              id="tax-percent"
              type="number"
              step="0.01"
              value={formData.invoice?.taxPercent || ''}
              onChange={(e) => updateInvoice('taxPercent', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="subtotal">Subtotal</Label>
            <Input
              id="subtotal"
              type="number"
              step="0.01"
              value={formData.invoice?.subtotal || ''}
              onChange={(e) => updateInvoice('subtotal', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="total">Total</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={formData.invoice?.total || ''}
              onChange={(e) => updateInvoice('total', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="po-number">PO Number</Label>
            <Input
              id="po-number"
              value={formData.invoice?.poNumber || ''}
              onChange={(e) => updateInvoice('poNumber', e.target.value)}
              placeholder="PO number"
            />
          </div>
          <div>
            <Label htmlFor="po-date">PO Date</Label>
            <Input
              id="po-date"
              type="date"
              value={formData.invoice?.poDate || ''}
              onChange={(e) => updateInvoice('poDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Line Items</h3>
          <Button onClick={addLineItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {formData.invoice?.lineItems?.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 items-end">
            <div>
              <Label>Description</Label>
              <Input
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                placeholder="Item description"
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                placeholder="1"
              />
            </div>
            <div>
              <Label>Total</Label>
              <Input
                type="number"
                step="0.01"
                value={item.total}
                onChange={(e) => updateLineItem(index, 'total', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeLineItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <div>
          {onDelete && (
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}