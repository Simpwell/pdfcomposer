import { useState } from 'react'
import { MergePDF } from './components/MergePDF'
import { ReorderPages } from './components/ReorderPages'
import { DeletePages } from './components/DeletePages'
import { ExtractPages } from './components/ExtractPages'
import { SplitPDF } from './components/SplitPDF'

export function App() {
  const [activeTab, setActiveTab] = useState('merge')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">PDF Composer</h1>
      <p className="text-sm text-gray-600 mb-6">
        🔒 すべての処理はブラウザ内で完結 - PDFファイルがサーバーに送信されることはありません<br />
        ⚡️ 高速処理 - ネットワーク遅延なしでPDFを操作<br />
        💻 オフライン対応 - インターネット接続なしで利用可能
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'merge'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('merge')}
          >
            PDF結合
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'reorder'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('reorder')}
          >
            ページ並び替え
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'delete'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('delete')}
          >
            ページ削除
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'extract'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('extract')}
          >
            ページ抽出
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'split'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('split')}
          >
            PDF分割
          </button>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          {activeTab === 'merge' && <MergePDF />}
          {activeTab === 'reorder' && <ReorderPages />}
          {activeTab === 'delete' && <DeletePages />}
          {activeTab === 'extract' && <ExtractPages />}
          {activeTab === 'split' && <SplitPDF />}
        </div>
      </div>
    </div>
  )
}
