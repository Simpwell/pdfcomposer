import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface PDFPagePreviewProps {
  pdfDocument: PDFDocumentProxy
  pageNumber: number
  width?: number
  height?: number
}

export function PDFPagePreview({
  pdfDocument,
  pageNumber,
  width = 150,
  height = 200,
}: PDFPagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<any>(null)

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return

      try {
        const page = await pdfDocument.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 0.3 })
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (!context) return

        canvas.width = width
        canvas.height = height

        // 前回のレンダリングタスクをキャンセル
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel()
        }

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport,
        })

        await renderTaskRef.current.promise
      } catch (error) {
        console.error('Error rendering PDF page:', error)
      }
    }

    renderPage()

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }
    }
  }, [pdfDocument, pageNumber, width, height])

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-200 rounded-lg shadow-sm"
      style={{ width, height }}
    />
  )
} 