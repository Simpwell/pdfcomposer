import * as pdfjsLib from 'pdfjs-dist'

// PDFワーカーをnode_modulesから直接読み込むように設定
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.js'

// 必要な型と関数をエクスポート
export type { PDFDocumentProxy } from 'pdfjs-dist'
export const { getDocument } = pdfjsLib

export { pdfjsLib } 