import React, { useState, useEffect } from 'react';
import { FilePlus } from 'lucide-react';
import { PDFDropZone } from './PDFDropZone';
import { SelectablePagePreview } from './SelectablePagePreview';
import { usePDFUpload } from '../hooks/usePDFUpload';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const ExtractPages: React.FC = () => {
  const { files, error, handleFileUpload, handleDrop, handleDragOver, clearFiles } =
    usePDFUpload();
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadPDF = async () => {
      if (files.length > 0) {
        try {
          const arrayBuffer = await files[0].arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setSelectedPages(new Set());
        } catch (error) {
          console.error('Error loading PDF:', error);
          alert('PDFの読み込み中にエラーが発生しました');
        }
      } else {
        setPdfDocument(null);
        setTotalPages(0);
        setSelectedPages(new Set());
      }
    };

    loadPDF();
  }, [files]);

  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages(prev => {
      const newSelectedPages = new Set(prev);
      if (newSelectedPages.has(pageNumber)) {
        newSelectedPages.delete(pageNumber);
      } else {
        newSelectedPages.add(pageNumber);
      }
      return newSelectedPages;
    });
  };

  const handleExtract = async () => {
    if (!pdfDocument || selectedPages.size === 0) {
      alert('抽出するページを選択してください');
      return;
    }

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      for (const pageNumber of sortedPages) {
        const [page] = await newPdf.copyPages(pdfDoc, [pageNumber - 1]);
        newPdf.addPage(page);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted_pages.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      clearFiles();
    } catch (error) {
      console.error('Error extracting pages:', error);
      alert('ページの抽出中にエラーが発生しました');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">ページ抽出</h2>
      {!pdfDocument ? (
        <PDFDropZone
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onFileSelect={handleFileUpload}
          icon={<FilePlus size={48} />}
          message="抽出元のPDFファイルをドラッグ&ドロップまたは"
        />
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <SelectablePagePreview
                key={pageNumber}
                pageNumber={pageNumber}
                pdfDocument={pdfDocument}
                isSelected={selectedPages.has(pageNumber)}
                onToggleSelect={() => togglePageSelection(pageNumber)}
                actionIcon="select"
              />
            ))}
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex gap-4">
            <button
              onClick={handleExtract}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              選択したページを抽出
            </button>
            <button
              onClick={clearFiles}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
            >
              クリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 