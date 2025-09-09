const pdfParse = require('pdf-parse');
const fs = require('fs');

async function testPDF() {
  try {
    console.log('📄 Testing the new PDF file...');
    
    const buffer = fs.readFileSync('working_sample_invoice.pdf');
    console.log('📁 File size:', buffer.length, 'bytes');
    
    const pdfData = await pdfParse(buffer);
    console.log('✅ PDF parsing successful!');
    console.log('📝 Extracted text:', pdfData.text);
    console.log('📊 Text length:', pdfData.text.length);
    
  } catch (error) {
    console.error('❌ PDF parsing failed:', error.message);
  }
}

testPDF();