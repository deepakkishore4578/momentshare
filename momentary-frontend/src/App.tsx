import { useState } from 'react';
import Header from './components/Header';
// 1. Import our new form components
import UploadForm from './components/UploadForm';
import DownloadForm from './components/DownloadForm';

type Tab = 'upload' | 'download';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  // Helper function for the tab button styles
  const getTabClass = (tabName: 'upload' | 'download') => {
    return tabName === activeTab
      ? 'bg-gray-800 text-white px-4 py-2 rounded-md font-medium'
      : 'bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-50';
  };

  return (
    // Add the 'light' class to prevent OS dark mode from breaking styles
    <div className="light bg-gray-50 min-h-screen flex flex-col">
      
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        
        {/* Page Title */}
        <h2 className="text-3xl font-semibold mb-2 text-gray-900">
          Share files quickly and securely
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a file, pick retention, share a 4-character code. Files auto-expire.
        </p>

        {/* Tab Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('upload')}
            className={getTabClass('upload')}
          >
            Upload
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={getTabClass('download')}
          >
            Download
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          
          {/* 3. Conditionally render the correct form */}
          {activeTab === 'upload' ? <UploadForm /> : <DownloadForm />}

        </div>

        <p className="text-xs text-gray-500 mt-4">
          Files auto-deleted after 10/20/30 minutes. Avoid sensitive data.
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-between text-sm text-gray-600">
          <span>TempShare</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;