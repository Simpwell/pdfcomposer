import React from 'react';
import { Combine } from 'lucide-react';
import { PDFDropZone } from './PDFDropZone';
import { PDFThumbnail } from './PDFThumbnail';
import { usePDFUpload } from '../hooks/usePDFUpload';
import { PDFDocument } from 'pdf-lib';

export const MergePDF: React.FC = () => {
  const {
    files,
    error,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    removeFile,
    clearFiles
  } = usePDFUpload();

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('2つ以上のPDFファイルを選択してください');
      return;
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      clearFiles();
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('PDFの結合中にエラーが発生しました');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">PDF結合</h2>
      {files.length === 0 ? (
        <PDFDropZone
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onFileSelect={handleFileUpload}
          icon={<Combine size={48} />}
          message="結合するPDFファイルをドラッグ&ドロップまたは"
        />
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            {files.map((file, index) => (
              <PDFThumbnail
                key={index}
                file={file}
                onRemove={() => removeFile(index)}
              />
            ))}
            <PDFDropZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onFileSelect={handleFileUpload}
              isAddMore
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex gap-4">
            <button
              onClick={handleMerge}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              PDFを結合
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