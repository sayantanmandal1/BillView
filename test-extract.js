// Test script to debug the extraction issue
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

async function testExtraction() {
  console.log('🧪 Testing PDF extraction...\n');

  // First, let's check if we have any files in the database
  try {
    console.log('1️⃣ Checking existing invoices...');
    const response = await fetch(`${API_BASE}/invoices`);
    const invoices = await response.json();
    console.log('📋 Existing invoices:', invoices.length);
    
    if (invoices.length > 0) {
      console.log('📄 First invoice fileId:', invoices[0].fileId);
      
      // Try to extract from an existing file
      console.log('\n2️⃣ Testing extraction with existing file...');
      const extractResponse = await fetch(`${API_BASE}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileId: invoices[0].fileId, 
          model: 'gemini' 
        }),
      });
      
      const extractResult = await extractResponse.json();
      console.log('🤖 Extract response status:', extractResponse.status);
      console.log('🤖 Extract response:', JSON.stringify(extractResult, null, 2));
      
      if (!extractResponse.ok) {
        console.log('❌ Extraction failed with existing file');
      } else {
        console.log('✅ Extraction successful with existing file');
      }
    } else {
      console.log('📝 No existing invoices found. Upload a PDF first through the web interface.');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test with invalid fileId
  console.log('\n3️⃣ Testing with invalid fileId...');
  try {
    const response = await fetch(`${API_BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fileId: '507f1f77bcf86cd799439011', // Valid ObjectId format but doesn't exist
        model: 'gemini' 
      }),
    });
    
    const result = await response.json();
    console.log('📤 Invalid fileId response status:', response.status);
    console.log('📤 Invalid fileId response:', result);
  } catch (error) {
    console.log('❌ Invalid fileId test failed:', error.message);
  }

  console.log('\n🎉 Extraction test completed!');
}

testExtraction().catch(console.error);