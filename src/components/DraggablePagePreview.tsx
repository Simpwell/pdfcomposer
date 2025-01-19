import React from 'react';
import { PDFPagePreview } from './PDFPagePreview';
import { PDFDocumentProxy } from 'pdfjs-dist';

interface PDFPageThumbnailProps {
  pageNumber: number;
  pdfDocument: PDFDocumentProxy;
}

export const PDFPageThumbnail: React.FC<PDFPageThumbnailProps> = ({
  pageNumber,
  pdfDocument,
}) => {
  return (
    <div className="relative cursor-move">
      <PDFPagePreview pageNumber={pageNumber} pdfDocument={pdfDocument} />
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {pageNumber}
      </div>
    </div>
  );
}; 