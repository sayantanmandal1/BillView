const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function createValidPDF() {
  try {
    console.log('📄 Creating a valid PDF using pdf-lib...');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page
    const page = pdfDoc.addPage([612, 792]);
    
    // Get font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add text content
    page.drawText('Sample Invoice', {
      x: 50,
      y: 750,
      size: 20,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Invoice Number: INV-001', {
      x: 50,
      y: 720,
      size: 12,
      font: font,
    });
    
    page.drawText('Date: 2025-01-01', {
      x: 50,
      y: 700,
      size: 12,
      font: font,
    });
    
    page.drawText('Vendor: Sample Company Ltd', {
      x: 50,
      y: 680,
      size: 12,
      font: font,
    });
    
    page.drawText('Address: 123 Main Street, City, State 12345', {
      x: 50,
      y: 660,
      size: 12,
      font: font,
    });
    
    page.drawText('Tax ID: 123456789', {
      x: 50,
      y: 640,
      size: 12,
      font: font,
    });
    
    page.drawText('Total Amount: $150.00', {
      x: 50,
      y: 600,
      size: 14,
      font: font,
      color: rgb(0, 0.5, 0),
    });
    
    page.drawText('Currency: USD', {
      x: 50,
      y: 580,
      size: 12,
      font: font,
    });
    
    page.drawText('PO Number: PO-2025-001', {
      x: 50,
      y: 560,
      size: 12,
      font: font,
    });
    
    // Line items
    page.drawText('Line Items:', {
      x: 50,
      y: 520,
      size: 14,
      font: font,
    });
    
    page.drawText('1. Consulting Services - Qty: 10, Unit Price: $12.00, Total: $120.00', {
      x: 70,
      y: 500,
      size: 10,
      font: font,
    });
    
    page.drawText('2. Software License - Qty: 1, Unit Price: $30.00, Total: $30.00', {
      x: 70,
      y: 485,
      size: 10,
      font: font,
    });
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Write to file
    fs.writeFileSync('working_sample_invoice.pdf', pdfBytes);
    
    console.log('✅ Created working_sample_invoice.pdf');
    console.log('📊 File size:', pdfBytes.length, 'bytes');
    
    return pdfBytes;
    
  } catch (error) {
    console.error('❌ Failed to create PDF:', error);
  }
}

createValidPDF();