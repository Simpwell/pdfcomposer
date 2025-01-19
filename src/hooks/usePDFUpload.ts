import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

export type PDFFile = File;

export const usePDFUpload = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const handleFileUpload = useCallback(async (uploadedFiles: FileList | File[]) => {
    setError(null);
    const fileList = Array.from(uploadedFiles);
    
    if (fileList.length === 0) {
      setError('ファイルが選択されていません');
      return;
    }

    const invalidFiles = fileList.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      setError('PDFファイルを選択してください');
      return;
    }

    try {
      // For single file operations (like page reordering, splitting, etc.)
      if (files.length === 0) {
        const arrayBuffer = await fileList[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        setPdfDocument(pdf);
      }
      
      setFiles(prev => [...prev, ...fileList]);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setError('PDFの読み込み中にエラーが発生しました');
    }
  }, [files]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileUpload(event.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setPdfDocument(null);
      }
      return newFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setPdfDocument(null);
    setError(null);
  }, []);

  return {
    files,
    error,
    pdfDocument,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    removeFile,
    clearFiles,
  };
}; 