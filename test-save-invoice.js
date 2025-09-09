// Test script to save extracted invoice data
const API_BASE = 'http://localhost:3001';

async function testSaveInvoice() {
  const { default: fetch } = await import('node-fetch');
  console.log('🧪 Testing invoice save functionality...\n');

  try {
    // Use the extracted data from our previous test
    const sampleInvoiceData = {
      fileId: '68c06ba96db560a73a9470e6', // From our previous upload
      fileName: 'sample_invoice.pdf',
      vendor: {
        name: 'Sample Vendor Address',
        address: 'Vendor AddressSample Vendor Address',
        taxId: '123456789'
      },
      invoice: {
        number: 'INV-001',
        date: '2025-01-01',
        currency: 'USD',
        subtotal: 57,
        taxPercent: 0,
        total: 57,
        poNumber: 'PO-001',
        poDate: '2025-01-01',
        lineItems: [
          {
            description: 'Sample Item A',
            unitPrice: 21,
            quantity: 2,
            total: 42
          },
          {
            description: 'Sample Item B',
            unitPrice: 15,
            quantity: 1,
            total: 15
          }
        ]
      },
      createdAt: new Date().toISOString()
    };

    console.log('💾 Saving invoice to database...');
    const saveResponse = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleInvoiceData),
    });

    console.log('📤 Save response status:', saveResponse.status);
    const saveResult = await saveResponse.json();

    if (saveResponse.ok) {
      console.log('✅ Invoice saved successfully!');
      console.log('📊 Saved invoice:', JSON.stringify(saveResult, null, 2));
      
      // Test fetching the saved invoice
      console.log('\n📋 Fetching saved invoice...');
      const fetchResponse = await fetch(`${API_BASE}/invoices/${saveResult._id}`);
      const fetchResult = await fetchResponse.json();
      
      if (fetchResponse.ok) {
        console.log('✅ Invoice fetched successfully!');
        console.log('📄 Fetched invoice:', JSON.stringify(fetchResult, null, 2));
      } else {
        console.log('❌ Failed to fetch invoice:', fetchResult);
      }
      
    } else {
      console.log('❌ Failed to save invoice:', saveResult);
    }

    // Test listing all invoices
    console.log('\n📋 Listing all invoices...');
    const listResponse = await fetch(`${API_BASE}/invoices`);
    const listResult = await listResponse.json();
    
    if (listResponse.ok) {
      console.log(`✅ Found ${listResult.length} invoices`);
      listResult.forEach((invoice, index) => {
        console.log(`${index + 1}. ${invoice.vendor.name} - ${invoice.invoice.number} - $${invoice.invoice.total}`);
      });
    } else {
      console.log('❌ Failed to list invoices:', listResult);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n🎉 Invoice save test completed!');
}

testSaveInvoice().catch(console.error);