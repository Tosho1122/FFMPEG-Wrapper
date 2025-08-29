import { useState, useEffect } from 'react';
import './App.css';
import SettingsTab from './components/tabs/SettingsTab';
import VideoTab from './components/tabs/VideoTab';
import AudioTab from './components/tabs/AudioTab';
import PacManLoader from './components/PacManLoader';


interface Progress {
  percent?: number;
  timemark?: string;
}

type TabType = 'settings' | 'video' | 'audio';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('video');
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onProgress((progressData: Progress) => {
        setProgress(progressData);
      });

      window.electronAPI.onComplete((outputPath: string) => {
        setIsProcessing(false);
        setProgress(null);
        setStatus(`Completed! Output saved to: ${outputPath}`);
      });

      window.electronAPI.onError((error: string) => {
        setIsProcessing(false);
        setProgress(null);
        setStatus(`Error: ${error}`);
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('ffmpeg-progress');
        window.electronAPI.removeAllListeners('ffmpeg-complete');
        window.electronAPI.removeAllListeners('ffmpeg-error');
      }
    };
  }, []);

  const handleProcessingStart = async (operation: string, inputFile: string, outputFile: string, options: any) => {
    if (!window.electronAPI) return;
    
    setIsProcessing(true);
    setProgress(null);
    setStatus('Processing...');
    
    try {
      switch (operation) {
        case 'convert':
          await window.electronAPI.convertVideo(inputFile, outputFile, options);
          break;
        case 'compress':
          await window.electronAPI.compressVideo(inputFile, outputFile, options.quality || '28');
          break;
        case 'extract-audio':
        case 'convertAudio':
          await window.electronAPI.extractAudio(inputFile, outputFile);
          break;
      }
    } catch (error) {
      setIsProcessing(false);
      setStatus(`Error: ${error}`);
    }
  };

  const tabs = [
    { id: 'video' as TabType, label: 'Video', icon: '🎥' },
    { id: 'audio' as TabType, label: 'Audio', icon: '🎵' },
    { id: 'settings' as TabType, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          FFmpeg Wrapper
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'video' && (
              <VideoTab onProcessingStart={handleProcessingStart} />
            )}
            {activeTab === 'audio' && (
              <AudioTab onProcessingStart={handleProcessingStart} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        </div>

        <PacManLoader 
          progress={progress?.percent || 0} 
          isVisible={isProcessing && progress !== null}
        />

        {status && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {status.includes('Error') ? (
                  <span className="text-red-500">❌</span>
                ) : status.includes('Completed') ? (
                  <span className="text-green-500">✅</span>
                ) : (
                  <span className="text-blue-500">ℹ️</span>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Status</h3>
                <div className="mt-1 text-sm text-gray-600">
                  {status}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
