// Test complete flow: upload, extract, and save
const fs = require('fs');
const FormData = require('form-data');

const API_BASE = 'http://localhost:3001';

async function testCompleteFlow() {
  const { default: fetch } = await import('node-fetch');
  
  console.log('🧪 Testing complete flow: upload → extract → save...\n');

  try {
    // 1. Upload PDF
    console.log('1️⃣ Uploading PDF...');
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream('sample_invoice.pdf'));
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful:', uploadResult);
    
    // 2. Extract with Groq (more reliable)
    console.log('\n2️⃣ Extracting with Groq...');
    const extractResponse = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fileId: uploadResult.fileId, 
        model: 'groq' 
      }),
    });
    
    const extractResult = await extractResponse.json();
    console.log('✅ Extraction successful:', extractResult);
    
    // 3. Save invoice
    console.log('\n3️⃣ Saving invoice...');
    const saveData = {
      fileId: uploadResult.fileId,
      fileName: uploadResult.fileName,
      vendor: extractResult.vendor,
      invoice: extractResult.invoice,
    };
    
    console.log('💾 Save data:', JSON.stringify(saveData, null, 2));
    
    const saveResponse = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData),
    });
    
    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      console.error('❌ Save failed:', errorData);
      return;
    }
    
    const saveResult = await saveResponse.json();
    console.log('✅ Invoice saved successfully!');
    console.log('📊 Saved invoice ID:', saveResult._id);
    
    // 4. Verify by fetching all invoices
    console.log('\n4️⃣ Verifying saved invoice...');
    const listResponse = await fetch(`${API_BASE}/invoices`);
    const invoices = await listResponse.json();
    
    console.log(`✅ Found ${invoices.length} invoices in database`);
    invoices.forEach((invoice, index) => {
      console.log(`${index + 1}. ${invoice.vendor.name} - ${invoice.invoice.number} - ${invoice.invoice.currency} ${invoice.invoice.total}`);
    });
    
    // 5. Test fetching specific invoice
    console.log('\n5️⃣ Fetching specific invoice...');
    const getResponse = await fetch(`${API_BASE}/invoices/${saveResult._id}`);
    const specificInvoice = await getResponse.json();
    
    console.log('✅ Specific invoice fetched successfully');
    console.log('📄 Invoice details:', {
      vendor: specificInvoice.vendor.name,
      number: specificInvoice.invoice.number,
      total: specificInvoice.invoice.total,
      lineItems: specificInvoice.invoice.lineItems.length
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('\n🎉 Complete flow test finished!');
}

testCompleteFlow().catch(console.error);