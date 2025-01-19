import React, { useRef } from 'react';
import { FileText, Plus } from 'lucide-react';

interface PDFDropZoneProps {
  message?: string;
  isAddMore?: boolean;
  onFileSelect: (uploadedFiles: File[] | FileList) => Promise<void>;
}

export function PDFDropZone({
  message = 'PDFファイルをドラッグ&ドロップまたは',
  isAddMore = false,
  onFileSelect
}: PDFDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {isAddMore ? <Plus size={48} /> : <FileText size={48} />}
      <p className="mt-2">
        {message}
        <span className="text-blue-500 hover:text-blue-600">
          クリックしてファイルを選択
        </span>
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple={!isAddMore}
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
} 