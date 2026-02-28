const fs = require('fs');

async function testPdfExtraction() {
  try {
    const buffer = fs.readFileSync('test.pdf');
    
    console.log('[TEST] Buffer size:', buffer.length);
    console.log('[TEST] Starting PDF extraction with pdf-parse...');
    
    // pdf-parse is Node.js optimized library for PDF text extraction
    const { PDFParse } = require('pdf-parse');
    
    console.log('[TEST] PDFParse loaded, type:', typeof PDFParse);
    
    // Create parser instance and load PDF (must be Uint8Array, not Buffer)
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Array);
    await parser.load();
    
    // Get text from all pages
    const result = await parser.getText();
    const data = { text: result.text, numpages: result.pages?.length || 1 };
    
    console.log('[TEST] PDF parsed successfully!');
    console.log('[TEST] Number of pages:', data.numpages);
    console.log('[TEST] Extracted text length:', data.text.length);
    console.log('[TEST] First 200 chars:', data.text.substring(0, 200));
    console.log('[TEST] SUCCESS!');
    
  } catch (e) {
    console.error('[TEST] Error:', e.message);
    console.error('[TEST] Stack:', e.stack);
  }
}

testPdfExtraction();
