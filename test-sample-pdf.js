// Test script to upload and extract from sample_invoice.pdf
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

async function testSamplePDF() {
  console.log('🧪 Testing with sample_invoice.pdf...\n');

  // Check if sample PDF exists
  const pdfPath = path.join(__dirname, 'sample_invoice.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ sample_invoice.pdf not found in current directory');
    return;
  }

  const pdfStats = fs.statSync(pdfPath);
  console.log('📄 Found sample PDF:', {
    size: `${(pdfStats.size / 1024).toFixed(2)} KB`,
    path: pdfPath
  });

  try {
    // Step 1: Upload the PDF
    console.log('\n1️⃣ Uploading sample PDF...');
    
    const formData = new FormData();
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('pdf', pdfBlob, 'sample_invoice.pdf');

    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    const uploadResult = await uploadResponse.json();
    console.log('📤 Upload status:', uploadResponse.status);
    console.log('📤 Upload result:', uploadResult);

    if (!uploadResponse.ok) {
      console.log('❌ Upload failed:', uploadResult.error);
      return;
    }

    const fileId = uploadResult.fileId;
    console.log('✅ Upload successful! FileId:', fileId);

    // Step 2: Test extraction with Gemini
    console.log('\n2️⃣ Testing extraction with Gemini...');
    
    const extractResponse = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, model: 'gemini' }),
    });

    const extractResult = await extractResponse.json();
    console.log('🤖 Extract status:', extractResponse.status);
    console.log('🤖 Extract result:', JSON.stringify(extractResult, null, 2));

    if (!extractResponse.ok) {
      console.log('❌ Extraction failed:', extractResult.error);
      if (extractResult.details) {
        console.log('📝 Details:', extractResult.details);
      }
    } else {
      console.log('✅ Extraction successful!');
    }

    // Step 3: Test file download
    console.log('\n3️⃣ Testing file download...');
    
    const downloadResponse = await fetch(`${API_BASE}/files/${fileId}`);
    console.log('📥 Download status:', downloadResponse.status);
    
    if (downloadResponse.ok) {
      console.log('✅ File download successful');
    } else {
      console.log('❌ File download failed');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('📝 Full error:', error);
  }

  console.log('\n🎉 Sample PDF test completed!');
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
  global.FormData = require('form-data');
  global.Blob = require('blob-polyfill').Blob;
}

testSamplePDF().catch(console.error);