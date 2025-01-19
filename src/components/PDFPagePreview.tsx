import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface PDFPagePreviewProps {
  pageNumber: number
  pdfDocument: PDFDocumentProxy
  width?: number
  height?: number
}

export function PDFPagePreview({
  pageNumber,
  pdfDocument,
  width = 150,
  height = 200,
}: PDFPagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<any>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !pdfDocument) return

    const renderPage = async () => {
      const page = await pdfDocument.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 0.3 })

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (!context) return

      // 前回のレンダリングタスクをキャンセル
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }

      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport,
      })

      try {
        await renderTaskRef.current.promise
      } catch (error) {
        if (error.message !== 'Rendering cancelled') {
          console.error('Error rendering PDF page:', error)
        }
      }
    }

    renderPage()

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }
    }
  }, [pageNumber, pdfDocument, width, height])

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-200 rounded shadow-sm"
      style={{ width, height }}
    />
  )
} 