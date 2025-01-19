import { useState } from 'react'
import { PDFDropZone } from './PDFDropZone'
import { usePDFUpload } from '../hooks/usePDFUpload'
import { getDocument } from '../lib/pdfjs'
import { createWorker } from 'tesseract.js'

export function ExtractText() {
  const { files, handleFileUpload, removeFile, clearFiles } = usePDFUpload()
  const [extractedText, setExtractedText] = useState<string>('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isOCRMode, setIsOCRMode] = useState(false)

  const handleExtractText = async () => {
    if (!files[0]) return
    setIsExtracting(true)
    try {
      const pdfDoc = await getDocument(files[0]).promise
      const numPages = pdfDoc.numPages
      let fullText = ''

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += `=== Page ${i} ===\n${pageText}\n\n`
      }

      if (fullText.trim()) {
        setExtractedText(fullText)
        setIsOCRMode(false)
      } else {
        setIsOCRMode(true)
        await handleOCR(pdfDoc)
      }
    } catch (error) {
      console.error('テキスト抽出エラー:', error)
      alert('テキストの抽出中にエラーが発生しました')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleOCR = async (pdfDoc: any) => {
    try {
      const worker = await createWorker('jpn')
      let fullText = ''

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const { data: { text } } = await worker.recognize(canvas)
        fullText += `=== Page ${i} ===\n${text}\n\n`
      }

      await worker.terminate()
      setExtractedText(fullText)
    } catch (error) {
      console.error('OCRエラー:', error)
      alert('OCR処理中にエラーが発生しました')
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText)
    alert('テキストをクリップボードにコピーしました')
  }

  return (
    <div className="space-y-4">
      <PDFDropZone
        message="PDFファイルをドロップ、またはクリックしてファイルを選択"
        onFileUpload={handleFileUpload}
      />
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleExtractText}
              disabled={isExtracting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isExtracting ? (isOCRMode ? 'OCR処理中...' : 'テキスト抽出中...') : 'テキストを抽出'}
            </button>
            <button
              onClick={clearFiles}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              クリア
            </button>
          </div>
          {extractedText && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                {isOCRMode && (
                  <div className="text-sm text-gray-600">
                    ※ OCRで認識したテキストを表示しています
                  </div>
                )}
                <button
                  onClick={handleCopyText}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  クリップボードにコピー
                </button>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg min-h-[200px] whitespace-pre-wrap">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 