import { useState, useEffect } from 'react';
import './App.css';
import SettingsTab from './components/tabs/SettingsTab';
import VideoTab from './components/tabs/VideoTab';
import AudioTab from './components/tabs/AudioTab';
import PacManLoader from './components/PacManLoader';
import { MdVideoLibrary, MdAudiotrack, MdSettings } from 'react-icons/md';


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
  const [completedFilePath, setCompletedFilePath] = useState<string | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onProgress((progressData: Progress) => {
        setProgress(progressData);
      });

      window.electronAPI.onComplete((outputPath: string) => {
        setIsProcessing(false);
        setProgress(null);
        setCompletedFilePath(outputPath);
        setStatus(`Completed! Output saved to: ${outputPath}`);
      });

      window.electronAPI.onError((error: string) => {
        setIsProcessing(false);
        setProgress(null);
        setCompletedFilePath(null);
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
    setCompletedFilePath(null);
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
      setCompletedFilePath(null);
      setStatus(`Error: ${error}`);
    }
  };

  const handleGoToFile = async () => {
    if (completedFilePath && window.electronAPI) {
      await window.electronAPI.revealFile(completedFilePath);
    }
  };

  const tabs = [
    { id: 'video' as TabType, label: 'Video', icon: MdVideoLibrary },
    { id: 'audio' as TabType, label: 'Audio', icon: MdAudiotrack },
    { id: 'settings' as TabType, label: 'Settings', icon: MdSettings },
  ];

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        background: '#0f172a',
        margin: 0,
        padding: 0,
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Dark modern navbar */}
      <nav 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
        }}
      >
        <div style={{ padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="/ffmpegwrapper.png" 
                alt="FFmpeg Wrapper" 
                style={{ width: '32px', height: '32px' }}
                onError={(e) => {
                  // Fallback to text logo if image not found
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(45deg, #3b82f6, #1e40af)',
                  borderRadius: '8px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>FF</span>
              </div>
              <h1 
                style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#e2e8f0',
                  letterSpacing: '-0.025em',
                  margin: 0
                }}
              >
                FFmpeg Wrapper
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: activeTab === tab.id 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'transparent',
                      color: activeTab === tab.id 
                        ? '#3b82f6' 
                        : '#94a3b8',
                      boxShadow: activeTab === tab.id 
                        ? '0 0 0 1px rgba(59, 130, 246, 0.3)' 
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.3)';
                        e.currentTarget.style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <IconComponent size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content - full width, no margins */}
      <div 
        style={{ 
          paddingTop: '60px',
          width: '100vw',
          minHeight: 'calc(100vh - 60px)',
          background: '#0f172a'
        }}
      >
        {/* Status and Loading at the top */}
        <div style={{ padding: '24px 24px 0 24px' }}>
          <PacManLoader 
            progress={progress?.percent || 0} 
            isVisible={isProcessing && progress !== null}
          />

          {status && (
            <div 
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginRight: '12px' }}>
                    {status.includes('Error') ? (
                      <span style={{ color: '#ef4444', fontSize: '18px' }}>❌</span>
                    ) : status.includes('Completed') ? (
                      <span style={{ color: '#10b981', fontSize: '18px' }}>✅</span>
                    ) : (
                      <span style={{ color: '#3b82f6', fontSize: '18px' }}>ℹ️</span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', margin: 0, marginBottom: '2px' }}>Status</h3>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                      {status}
                    </div>
                  </div>
                </div>
                {completedFilePath && (
                  <button
                    onClick={handleGoToFile}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    📁 Go to File
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
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
    </div>
  );
}

export default App;
