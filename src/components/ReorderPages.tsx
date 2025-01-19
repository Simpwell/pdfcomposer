import { useState, useEffect } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { PDFDropZone } from './PDFDropZone'
import { DraggablePagePreview } from './DraggablePagePreview'
import { usePDFUpload } from '../hooks/usePDFUpload'
import { PDFDocument } from 'pdf-lib'

export function ReorderPages() {
  const { files, handleFileUpload, clearFiles } = usePDFUpload()
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const [pageOrder, setPageOrder] = useState<number[]>([])

  useEffect(() => {
    if (files[0]) {
      const loadPDF = async () => {
        try {
          const fileArrayBuffer = await files[0].arrayBuffer()
          const pdfDoc = await PDFDocument.load(fileArrayBuffer)
          setPdfDocument(pdfDoc)
          setPageOrder(Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i + 1))
        } catch (error) {
          console.error('PDFの読み込みエラー:', error)
          alert('PDFの読み込み中にエラーが発生しました')
        }
      }
      loadPDF()
    } else {
      setPdfDocument(null)
      setPageOrder([])
    }
  }, [files])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const items = Array.from(pageOrder)
    const [removed] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, removed)
    setPageOrder(items)
  }

  const handleSaveOrder = async () => {
    if (!pdfDocument) return
    try {
      const newPdfDoc = await PDFDocument.create()
      for (const pageNumber of pageOrder) {
        const [page] = await newPdfDoc.copyPages(pdfDocument, [pageNumber - 1])
        newPdfDoc.addPage(page)
      }
      const pdfBytes = await newPdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reordered.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDFの保存エラー:', error)
      alert('PDFの保存中にエラーが発生しました')
    }
  }

  return (
    <div className="space-y-4">
      <PDFDropZone
        message="PDFファイルをドロップ、またはクリックしてファイルを選択"
        onFileSelect={handleFileUpload}
      />
      {pdfDocument && (
        <div className="space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="pages">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-4 p-4 min-h-[200px] rounded-lg"
                >
                  {pageOrder.map((pageNumber, index) => (
                    <DraggablePagePreview
                      key={pageNumber}
                      pageNumber={pageNumber}
                      index={index}
                      pdfDocument={pdfDocument}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="flex gap-2">
            <button
              onClick={handleSaveOrder}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              この順序で保存
            </button>
            <button
              onClick={clearFiles}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              クリア
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 