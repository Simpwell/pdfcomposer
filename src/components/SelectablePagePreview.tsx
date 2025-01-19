import React from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Check, Trash2, FilePlus } from 'lucide-react';
import { PDFPagePreview } from './PDFPagePreview';

interface SelectablePagePreviewProps {
  pageNumber: number;
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  isSelected: boolean;
  onToggleSelect: () => void;
  actionIcon: 'select' | 'delete' | 'extract';
}

export const SelectablePagePreview: React.FC<SelectablePagePreviewProps> = ({
  pageNumber,
  pdfDocument,
  isSelected,
  onToggleSelect,
  actionIcon
}) => {
  const renderActionButton = () => {
    const baseClasses = 'absolute bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-full transition-all duration-200';
    const activeClasses = 'bg-blue-500 text-white';
    const inactiveClasses = 'bg-white text-gray-500 opacity-0 group-hover:opacity-100';

    switch (actionIcon) {
      case 'select':
        return (
          <button
            onClick={onToggleSelect}
            className={`${baseClasses} ${isSelected ? activeClasses : inactiveClasses}`}
          >
            <Check size={20} />
          </button>
        );
      case 'delete':
        return (
          <button
            onClick={onToggleSelect}
            className={`${baseClasses} ${isSelected ? activeClasses : inactiveClasses}`}
          >
            <Trash2 size={20} />
          </button>
        );
      case 'extract':
        return (
          <button
            onClick={onToggleSelect}
            className={`${baseClasses} ${isSelected ? activeClasses : inactiveClasses}`}
          >
            <FilePlus size={20} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative group ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
      <PDFPagePreview
        pageNumber={pageNumber}
        pdfDocument={pdfDocument}
      />
      {renderActionButton()}
    </div>
  );
}; 