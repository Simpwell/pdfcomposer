import { useState } from 'react'
import { X } from 'lucide-react'
import { PDFDropZone } from './PDFDropZone'
import { PDFThumbnail } from './PDFThumbnail'
import { PDFDocument } from 'pdf-lib'

export function MergePDF() {
  const [files, setFiles] = useState<File[]>([])

  const handleFileSelect = async (uploadedFiles: File[] | FileList) => {
    const newFiles = Array.from(uploadedFiles).filter(
      (file) => file.type === 'application/pdf'
    )
    if (newFiles.length === 0) {
      alert('PDFファイルを選択してください')
      return
    }
    setFiles((prevFiles) => [...prevFiles, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const handleClearFiles = () => {
    setFiles([])
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('2つ以上のPDFファイルを選択してください')
      return
    }

    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const fileArrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(fileArrayBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDFの結合エラー:', error)
      alert('PDFの結合中にエラーが発生しました')
    }
  }

  return (
    <div className="space-y-4">
      <PDFDropZone
        message="PDFファイルをドロップ、またはクリックしてファイルを選択"
        onFileSelect={handleFileSelect}
      />
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <PDFThumbnail file={file} />
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleMerge}
              disabled={files.length < 2}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              PDFを結合
            </button>
            <button
              onClick={handleClearFiles}
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