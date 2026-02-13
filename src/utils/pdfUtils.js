import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Merge multiple PDFs into one
 * @param {File[]} files - Array of PDF files
 * @returns {Promise<Blob>} Merged PDF blob
 */
export const mergePDFs = async (files) => {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

/**
 * Extract pages from PDF
 * @param {File} file - PDF file
 * @param {number[]} pageNumbers - Page numbers to extract
 * @returns {Promise<Blob>} Extracted PDF blob
 */
export const extractPages = async (file, pageNumbers) => {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  for (const pageNum of pageNumbers) {
    const [page] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
    newPdf.addPage(page);
  }
  
  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

/**
 * Add watermark to PDF
 * @param {File} file - PDF file
 * @param {string} text - Watermark text
 * @returns {Promise<Blob>} Watermarked PDF blob
 */
export const addWatermark = async (file, text) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  
  pages.forEach(page => {
    const { width, height } = page.getSize();
    
    page.drawText(text, {
      x: width / 2 - 100,
      y: height / 2,
      size: 24,
      font: helveticaFont,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.3,
    });
  });
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

/**
 * Compress PDF
 * @param {File} file - PDF file
 * @returns {Promise<Blob>} Compressed PDF blob
 */
export const compressPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Remove metadata and compress
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  
  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

/**
 * Rotate PDF pages
 * @param {File} file - PDF file
 * @param {number} degrees - Rotation degrees
 * @returns {Promise<Blob>} Rotated PDF blob
 */
export const rotatePDF = async (file, degrees = 90) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const pages = pdfDoc.getPages();
  pages.forEach(page => {
    page.setRotation({ angle: degrees });
  });
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};