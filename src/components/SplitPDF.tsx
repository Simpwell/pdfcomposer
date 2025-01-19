import React, { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import { PDFDropZone } from './PDFDropZone';
import { PDFPagePreview } from './PDFPagePreview';
import { usePDFUpload } from '../hooks/usePDFUpload';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const SplitPDF: React.FC = () => {
  const { files, error, handleFileUpload, handleDrop, handleDragOver, clearFiles } =
    usePDFUpload();
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [splitPoint, setSplitPoint] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadPDF = async () => {
      if (files.length > 0) {
        try {
          const arrayBuffer = await files[0].arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          setPdfDocument(pdf);
          setTotalPages(pdf.numPages);
          setSplitPoint(null);
        } catch (error) {
          console.error('Error loading PDF:', error);
          alert('PDFの読み込み中にエラーが発生しました');
        }
      } else {
        setPdfDocument(null);
        setTotalPages(0);
        setSplitPoint(null);
      }
    };

    loadPDF();
  }, [files]);

  const handleSplit = async () => {
    if (!pdfDocument || splitPoint === null) {
      alert('分割ポイントを選択してください');
      return;
    }

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // 前半のPDFを作成
      const firstPdf = await PDFDocument.create();
      const firstPages = await firstPdf.copyPages(pdfDoc, Array.from({ length: splitPoint }, (_, i) => i));
      firstPages.forEach(page => firstPdf.addPage(page));

      // 後半のPDFを作成
      const secondPdf = await PDFDocument.create();
      const secondPages = await secondPdf.copyPages(
        pdfDoc,
        Array.from({ length: totalPages - splitPoint }, (_, i) => i + splitPoint)
      );
      secondPages.forEach(page => secondPdf.addPage(page));

      // 前半のPDFを保存
      const firstPdfBytes = await firstPdf.save();
      const firstBlob = new Blob([firstPdfBytes], { type: 'application/pdf' });
      const firstUrl = URL.createObjectURL(firstBlob);
      const firstLink = document.createElement('a');
      firstLink.href = firstUrl;
      firstLink.download = 'split_1.pdf';
      document.body.appendChild(firstLink);
      firstLink.click();
      document.body.removeChild(firstLink);
      URL.revokeObjectURL(firstUrl);

      // 後半のPDFを保存
      const secondPdfBytes = await secondPdf.save();
      const secondBlob = new Blob([secondPdfBytes], { type: 'application/pdf' });
      const secondUrl = URL.createObjectURL(secondBlob);
      const secondLink = document.createElement('a');
      secondLink.href = secondUrl;
      secondLink.download = 'split_2.pdf';
      document.body.appendChild(secondLink);
      secondLink.click();
      document.body.removeChild(secondLink);
      URL.revokeObjectURL(secondUrl);

      clearFiles();
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('PDFの分割中にエラーが発生しました');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">PDF分割</h2>
      {!pdfDocument ? (
        <PDFDropZone
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onFileSelect={handleFileUpload}
          icon={<Scissors size={48} />}
          message="分割するPDFファイルをドラッグ&ドロップまたは"
        />
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            ページとページの間の分割線をクリックして分割ポイントを設定してください
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <div key={pageNumber} className="relative">
                <PDFPagePreview
                  pageNumber={pageNumber}
                  pdfDocument={pdfDocument}
                />
                {pageNumber < totalPages && (
                  <div
                    className={`absolute -right-2 inset-y-0 w-4 flex items-center justify-center cursor-pointer group ${
                      splitPoint === pageNumber ? 'z-10' : ''
                    }`}
                    onClick={() => setSplitPoint(pageNumber)}
                  >
                    <div className={`w-0.5 h-full transition-all duration-200 ${
                      splitPoint === pageNumber
                        ? 'bg-blue-500'
                        : 'bg-gray-300 group-hover:bg-blue-300'
                    }`} />
                    <div className={`absolute p-1 rounded-full transition-all duration-200 ${
                      splitPoint === pageNumber
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100'
                    }`}>
                      <Scissors size={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex gap-4">
            <button
              onClick={handleSplit}
              disabled={splitPoint === null}
              className={`px-4 py-2 rounded transition-colors duration-200 ${
                splitPoint === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              PDFを分割
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