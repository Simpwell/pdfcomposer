import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFPagePreviewProps {
  pageNumber: number;
  pdfDocument: pdfjsLib.PDFDocumentProxy;
}

export const PDFPagePreview: React.FC<PDFPagePreviewProps> = ({
  pageNumber,
  pdfDocument,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const pageRef = useRef<pdfjsLib.PDFPageProxy | null>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;

      try {
        // Cancel any ongoing render task
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        // Clean up previous page
        if (pageRef.current) {
          await pageRef.current.cleanup();
          pageRef.current = null;
        }

        // Get new page
        pageRef.current = await pdfDocument.getPage(pageNumber);
        const viewport = pageRef.current.getViewport({ scale: 0.3 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          enableWebGL: false,
          renderInteractiveForms: false,
        };

        renderTaskRef.current = pageRef.current.render(renderContext);
        await renderTaskRef.current.promise;
      } catch (error) {
        console.error('Error rendering PDF page:', error);
      }
    };

    renderPage();

    return () => {
      const cleanup = async () => {
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
        if (pageRef.current) {
          await pageRef.current.cleanup();
          pageRef.current = null;
        }
      };
      cleanup();
    };
  }, [pageNumber, pdfDocument]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}; 