import React, { useState, useEffect } from 'react';
import { MoveVertical } from 'lucide-react';
import { PDFDropZone } from './PDFDropZone';
import { PDFPageThumbnail } from './DraggablePagePreview';
import { usePDFUpload } from '../hooks/usePDFUpload';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { ReactSortable } from 'react-sortablejs';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SortableItem {
  id: number;
}

export const ReorderPages: React.FC = () => {
  const {
    files,
    pdfDocument,
    handleDrop,
    handleDragOver,
    handleFileUpload,
    clearFiles,
    error
  } = usePDFUpload();

  const [pageOrder, setPageOrder] = useState<number[]>([]);

  useEffect(() => {
    if (pdfDocument) {
      setPageOrder(Array.from({ length: pdfDocument.numPages }, (_, i) => i + 1));
    }
  }, [pdfDocument]);

  const handleReorder = async () => {
    if (!pdfDocument || !files[0]) return;
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (const pageNumber of pageOrder) {
        const [page] = await newPdf.copyPages(originalPdf, [pageNumber - 1]);
        newPdf.addPage(page);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'reordered.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      clearFiles();
    } catch (err) {
      console.error('Error reordering pages:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {!pdfDocument ? (
        <PDFDropZone
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onFileSelect={handleFileUpload}
          icon={<MoveVertical size={48} />}
          message="編集するPDFファイルをドラッグ&ドロップまたは"
        />
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            ページをドラッグ&ドロップして順序を変更できます
          </p>
          <ReactSortable<SortableItem>
            list={pageOrder.map(id => ({ id }))}
            setList={(newList) => {
              setPageOrder(newList.map(item => item.id));
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4"
            animation={150}
          >
            {pageOrder.map((pageNumber) => (
              <div key={pageNumber} data-id={pageNumber}>
                <PDFPageThumbnail
                  pageNumber={pageNumber}
                  pdfDocument={pdfDocument}
                />
              </div>
            ))}
          </ReactSortable>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleReorder}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              この順序で保存
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