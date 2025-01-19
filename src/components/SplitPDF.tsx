import { useState, useEffect } from 'react'
import { PDFDropZone } from './PDFDropZone'
import { PDFPagePreview } from './PDFPagePreview'
import { usePDFUpload } from '../hooks/usePDFUpload'
import { PDFDocument } from 'pdf-lib'

export function SplitPDF() {
  const { files, handleFileUpload, clearFiles } = usePDFUpload()
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const [splitPoint, setSplitPoint] = useState<number | null>(null)

  useEffect(() => {
    if (files[0]) {
      const loadPDF = async () => {
        try {
          const fileArrayBuffer = await files[0].arrayBuffer()
          const pdfDoc = await PDFDocument.load(fileArrayBuffer)
          setPdfDocument(pdfDoc)
        } catch (error) {
          console.error('PDFの読み込みエラー:', error)
          alert('PDFの読み込み中にエラーが発生しました')
        }
      }
      loadPDF()
    } else {
      setPdfDocument(null)
      setSplitPoint(null)
    }
  }, [files])

  const handleSplit = async () => {
    if (!pdfDocument || splitPoint === null) return
    try {
      // 前半のPDFを作成
      const firstPdfDoc = await PDFDocument.create()
      for (let i = 0; i < splitPoint; i++) {
        const [page] = await firstPdfDoc.copyPages(pdfDocument, [i])
        firstPdfDoc.addPage(page)
      }
      const firstPdfBytes = await firstPdfDoc.save()
      const firstBlob = new Blob([firstPdfBytes], { type: 'application/pdf' })
      const firstUrl = URL.createObjectURL(firstBlob)
      const firstLink = document.createElement('a')
      firstLink.href = firstUrl
      firstLink.download = 'split_first.pdf'
      firstLink.click()
      URL.revokeObjectURL(firstUrl)

      // 後半のPDFを作成
      const secondPdfDoc = await PDFDocument.create()
      for (let i = splitPoint; i < pdfDocument.getPageCount(); i++) {
        const [page] = await secondPdfDoc.copyPages(pdfDocument, [i])
        secondPdfDoc.addPage(page)
      }
      const secondPdfBytes = await secondPdfDoc.save()
      const secondBlob = new Blob([secondPdfBytes], { type: 'application/pdf' })
      const secondUrl = URL.createObjectURL(secondBlob)
      const secondLink = document.createElement('a')
      secondLink.href = secondUrl
      secondLink.download = 'split_second.pdf'
      secondLink.click()
      URL.revokeObjectURL(secondUrl)
    } catch (error) {
      console.error('PDFの分割エラー:', error)
      alert('PDFの分割中にエラーが発生しました')
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
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: pdfDocument.getPageCount() }, (_, i) => i + 1).map(
              (pageNumber) => (
                <div
                  key={pageNumber}
                  className="relative"
                  onClick={() => setSplitPoint(pageNumber)}
                >
                  <PDFPagePreview pageNumber={pageNumber} pdfDocument={pdfDocument} />
                  <div
                    className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${
                      splitPoint === pageNumber
                        ? 'bg-blue-500 bg-opacity-50 text-white'
                        : 'hover:bg-gray-500 hover:bg-opacity-30 hover:text-white'
                    }`}
                  >
                    {pageNumber}
                  </div>
                </div>
              )
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSplit}
              disabled={splitPoint === null}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              この位置で分割
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