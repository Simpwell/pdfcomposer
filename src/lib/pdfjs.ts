import * as pdfjsLib from 'pdfjs-dist'

// PDFワーカーをCDNから読み込むように設定
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

// 必要な型と関数をエクスポート
export type { PDFDocumentProxy } from 'pdfjs-dist'
export const { getDocument } = pdfjsLib

export { pdfjsLib } 