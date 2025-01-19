import { Draggable } from 'react-beautiful-dnd';
import { PDFPagePreview } from './PDFPagePreview';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface DraggablePagePreviewProps {
  pageNumber: number;
  index: number;
  pdfDocument: PDFDocumentProxy;
}

export function DraggablePagePreview({
  pageNumber,
  index,
  pdfDocument
}: DraggablePagePreviewProps) {
  return (
    <Draggable draggableId={pageNumber.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="w-[150px]"
        >
          <PDFPagePreview
            pageNumber={pageNumber}
            pdfDocument={pdfDocument}
          />
        </div>
      )}
    </Draggable>
  );
} 