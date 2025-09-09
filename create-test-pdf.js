const fs = require('fs');

// Create a simple, valid PDF content
const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(Sample Invoice) Tj
0 -20 Td
(Invoice Number: INV-001) Tj
0 -20 Td
(Date: 2025-01-01) Tj
0 -20 Td
(Total: $100.00) Tj
0 -20 Td
(Vendor: Sample Company) Tj
0 -20 Td
(Address: 123 Main St) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
0000000250 00000 n 
0000000500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
580
%%EOF`;

// Write the PDF file
fs.writeFileSync('valid_sample_invoice.pdf', pdfContent);
console.log('✅ Created valid_sample_invoice.pdf');
console.log('📄 You can now test with this properly formatted PDF file');