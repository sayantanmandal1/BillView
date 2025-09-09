// Test script to upload a PDF and test extraction
const fs = require('fs');
const FormData = require('form-data');

const API_BASE = 'http://localhost:3001';

async function testFullFlow() {
  // Dynamic import for node-fetch (ESM module)
  const { default: fetch } = await import('node-fetch');
  console.log('🧪 Testing full PDF upload and extraction flow...\n');

  try {
    // Check if we have a sample PDF
    const pdfFiles = ['sample_invoice.pdf', 'valid_sample_invoice.pdf', 'working_sample_invoice.pdf'];
    let pdfPath = null;

    for (const file of pdfFiles) {
      if (fs.existsSync(file)) {
        pdfPath = file;
        break;
      }
    }

    if (!pdfPath) {
      console.log('❌ No sample PDF found. Expected one of:', pdfFiles);
      return;
    }

    console.log(`📄 Using PDF: ${pdfPath}`);

    // 1. Upload the PDF
    console.log('\n1️⃣ Uploading PDF...');
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(pdfPath));

    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.log('❌ Upload failed:', error);
      return;
    }

    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful:', uploadResult);

    // 2. Test extraction with Gemini
    console.log('\n2️⃣ Testing extraction with Gemini...');
    const geminiResponse = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: uploadResult.fileId,
        model: 'gemini'
      }),
    });

    console.log('🤖 Gemini response status:', geminiResponse.status);
    const geminiResult = await geminiResponse.json();

    if (geminiResponse.ok) {
      console.log('✅ Gemini extraction successful!');
      console.log('📊 Extracted data:', JSON.stringify(geminiResult, null, 2));
    } else {
      console.log('❌ Gemini extraction failed:', geminiResult);
    }

    // 3. Test extraction with Groq
    console.log('\n3️⃣ Testing extraction with Groq...');
    const groqResponse = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: uploadResult.fileId,
        model: 'groq'
      }),
    });

    console.log('🤖 Groq response status:', groqResponse.status);
    const groqResult = await groqResponse.json();

    if (groqResponse.ok) {
      console.log('✅ Groq extraction successful!');
      console.log('📊 Extracted data:', JSON.stringify(groqResult, null, 2));
    } else {
      console.log('❌ Groq extraction failed:', groqResult);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n🎉 Full flow test completed!');
}

testFullFlow().catch(console.error);