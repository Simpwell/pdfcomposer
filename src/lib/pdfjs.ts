import * as pdfjsLib from 'pdfjs-dist'

// PDFワーカーをローカルから読み込むように設定
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

export { pdfjsLib } 