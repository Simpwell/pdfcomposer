import { useState } from 'react'
import { Combine, Scissors, Trash2, FilePlus, MoveVertical } from 'lucide-react'
import { MergePDF } from './components/MergePDF'
import { ReorderPages } from './components/ReorderPages'
import { DeletePages } from './components/DeletePages'
import { ExtractPages } from './components/ExtractPages'
import { SplitPDF } from './components/SplitPDF'

// メインアプリケーション
const App = () => {
  const [currentTool, setCurrentTool] = useState('merge');

  const menuItems = [
    { id: 'merge', name: 'PDF結合', icon: Combine },
    { id: 'split', name: 'PDF分割', icon: Scissors },
    { id: 'delete', name: 'ページ削除', icon: Trash2 },
    { id: 'extract', name: 'ページ抽出', icon: FilePlus },
    { id: 'reorder', name: 'ページ順変更', icon: MoveVertical }
  ];

  const renderTool = () => {
    switch (currentTool) {
      case 'merge':
        return <MergePDF />;
      case 'split':
        return <SplitPDF />;
      case 'delete':
        return <DeletePages />;
      case 'extract':
        return <ExtractPages />;
      case 'reorder':
        return <ReorderPages />;
      default:
        return <MergePDF />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">PDF Composer</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentTool(item.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    currentTool === item.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="mr-2" size={20} />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          {renderTool()}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto p-4 text-center text-gray-500 text-sm">
        <p>© 2025 PDF Composer - ブラウザ内で安全にPDF編集</p>
      </footer>
    </div>
  );
};

export default App;
