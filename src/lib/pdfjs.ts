import * as pdfjsLib from 'pdfjs-dist'

// PDFワーカーをローカルから読み込むように設定
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

// 必要な型と関数をエクスポート
export type { PDFDocumentProxy } from 'pdfjs-dist'
export const { getDocument } = pdfjsLib 