import { useState } from 'react'
import { createWorker } from 'tesseract.js'
import { PDFDropZone } from './PDFDropZone'
import { usePDFUpload } from '../hooks/usePDFUpload'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getDocument } from '../lib/pdfjs'

export function ExtractText() {
  const { files, handleFileUpload, clearFiles } = usePDFUpload()
  const [extractedText, setExtractedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractTextFromPDF = async (pdfDocument: PDFDocumentProxy) => {
    setIsProcessing(true)
    setError(null)
    try {
      let fullText = ''
      
      // PDFの各ページからテキストを抽出
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        
        // テキストレイヤーが存在する場合
        if (pageText.trim()) {
          fullText += `Page ${i}:\n${pageText}\n\n`
        } else {
          // テキストレイヤーが存在しない場合、OCRを実行
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          const viewport = page.getViewport({ scale: 2.0 }) // 高解像度でレンダリング
          
          canvas.width = viewport.width
          canvas.height = viewport.height
          
          await page.render({
            canvasContext: context!,
            viewport: viewport
          }).promise
          
          const worker = await createWorker('jpn+eng')
          const { data: { text } } = await worker.recognize(canvas)
          await worker.terminate()
          
          fullText += `Page ${i} (OCR):\n${text}\n\n`
        }
      }
      
      setExtractedText(fullText)
    } catch (err) {
      setError('テキスト抽出中にエラーが発生しました')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExtract = async () => {
    if (files.length === 0) {
      setError('PDFファイルを選択してください')
      return
    }

    try {
      const pdfData = await files[0].arrayBuffer()
      const pdfDocument = await getDocument(pdfData).promise
      await extractTextFromPDF(pdfDocument)
    } catch (err) {
      setError('PDFの読み込み中にエラーが発生しました')
      console.error(err)
    }
  }

  const handleDownload = () => {
    if (!extractedText) return
    
    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted_text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileUpload(droppedFiles)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <PDFDropZone
        message="PDFファイルをドロップ"
        onFileSelect={handleFileUpload}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      
      {files.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg ${
              isProcessing
                ? 'bg-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isProcessing ? 'テキスト抽出中...' : 'テキストを抽出'}
          </button>
          <button
            onClick={() => clearFiles()}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            クリア
          </button>
        </div>
      )}

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      {extractedText && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
            >
              テキストをダウンロード
            </button>
          </div>
          <pre className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  )
} 