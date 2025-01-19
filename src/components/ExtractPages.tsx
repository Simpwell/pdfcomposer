import { useState, useEffect } from 'react'
import { PDFDropZone } from './PDFDropZone'
import { SelectablePagePreview } from './SelectablePagePreview'
import { usePDFUpload } from '../hooks/usePDFUpload'
import { PDFDocument } from 'pdf-lib'

export function ExtractPages() {
  const { files, handleFileUpload, clearFiles } = usePDFUpload()
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())

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
      setSelectedPages(new Set())
    }
  }, [files])

  const handleToggleSelect = (pageNumber: number) => {
    const newSelectedPages = new Set(selectedPages)
    if (selectedPages.has(pageNumber)) {
      newSelectedPages.delete(pageNumber)
    } else {
      newSelectedPages.add(pageNumber)
    }
    setSelectedPages(newSelectedPages)
  }

  const handleExtract = async () => {
    if (!pdfDocument || selectedPages.size === 0) return
    try {
      const newPdfDoc = await PDFDocument.create()
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b)
      for (const pageNumber of sortedPages) {
        const [page] = await newPdfDoc.copyPages(pdfDocument, [pageNumber - 1])
        newPdfDoc.addPage(page)
      }
      const pdfBytes = await newPdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'extracted_pages.pdf'
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
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: pdfDocument.getPageCount() }, (_, i) => i + 1).map(
              (pageNumber) => (
                <SelectablePagePreview
                  key={pageNumber}
                  pageNumber={pageNumber}
                  pdfDocument={pdfDocument}
                  isSelected={selectedPages.has(pageNumber)}
                  onToggleSelect={() => handleToggleSelect(pageNumber)}
                  actionIcon="extract"
                />
              )
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExtract}
              disabled={selectedPages.size === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              選択したページを抽出
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