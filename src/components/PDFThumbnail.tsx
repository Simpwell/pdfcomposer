import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { X } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFThumbnailProps {
  file: File;
  onRemove?: () => void;
  className?: string;
}

export const PDFThumbnail: React.FC<PDFThumbnailProps> = ({
  file,
  onRemove,
  className = ''
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: canvas.getContext('2d')!,
          viewport
        }).promise;

        setThumbnail(canvas.toDataURL());
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    };

    generateThumbnail();
  }, [file]);

  return (
    <div className={`relative group ${className}`}>
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={file.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-600 truncate">{file.name}</div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}; 