import React, { useRef } from 'react';
import { FileText, Plus } from 'lucide-react';

interface PDFDropZoneProps {
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (files: FileList) => void;
  icon?: React.ReactNode;
  message?: string;
  isAddMore?: boolean;
}

export const PDFDropZone: React.FC<PDFDropZoneProps> = ({
  onDrop,
  onDragOver,
  onFileSelect,
  icon = <FileText size={48} />,
  message = 'PDFファイルをドラッグ&ドロップまたは',
  isAddMore = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFileSelect(event.target.files);
    }
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200 hover:border-gray-400 ${
        isAddMore ? 'bg-gray-50' : ''
      }`}
    >
      <div className="mx-auto mb-4 text-gray-400">
        {isAddMore ? <Plus size={48} /> : icon}
      </div>
      <p className="mb-4 text-gray-600">
        {isAddMore ? 'PDFファイルを追加' : message}
      </p>
      <button
        onClick={handleClick}
        className={`${
          isAddMore
            ? 'bg-gray-500 hover:bg-gray-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white px-4 py-2 rounded transition-colors duration-200`}
      >
        {isAddMore ? 'ファイルを追加' : 'ファイルを選択'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}; 