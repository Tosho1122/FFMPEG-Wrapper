import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen bg-slate-900 m-0 p-0 w-screen overflow-hidden">
      {/* Dark modern navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-800 to-slate-700 backdrop-blur-lg border-b border-slate-600 border-opacity-30 shadow-md">
        <div className="px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/ffmpegwrapper.png" 
                alt="FFmpeg Wrapper" 
                className="w-8 h-8"
                onError={(e) => {
                  // Fallback to text logo if image not found
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg hidden items-center justify-center">
                <span className="text-white text-sm font-bold">FF</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-200 tracking-tight m-0">
                FFmpeg Wrapper
              </h1>
            </div>
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium flex items-center gap-2 border-none cursor-pointer relative ${
                      activeTab === tab.id 
                        ? 'bg-blue-500/15 text-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]' 
                        : 'bg-transparent text-slate-400'
                    }`}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: activeTab === tab.id ? undefined : 'rgba(71, 85, 105, 0.3)',
                      color: activeTab === tab.id ? undefined : '#e2e8f0'
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: activeTab === tab.id ? [0, 5, -5, 0] : 0,
                        scale: activeTab === tab.id ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute inset-0 bg-blue-500/10 rounded-lg"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content - full width, no margins */}
      <div className="pt-16 w-screen min-h-screen bg-slate-900" style={{minHeight: 'calc(100vh - 4rem)'}}>
        {/* Status and Loading at the top */}
        <div className="px-6 pt-4">
          <PacManLoader 
            progress={progress?.percent || 0} 
            isVisible={isProcessing && progress !== null}
          />

          <AnimatePresence>
            {status && (
              <motion.div 
                className="bg-slate-800/70 backdrop-blur-[10px] border border-slate-600/30 rounded-2xl px-5 py-4 mb-6 shadow-2xl"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <motion.div 
                      className="mr-3"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                    >
                      {status.includes('Error') ? (
                        <span className="text-red-500 text-lg">❌</span>
                      ) : status.includes('Completed') ? (
                        <span className="text-emerald-500 text-lg">✅</span>
                      ) : (
                        <span className="text-blue-500 text-lg">ℹ️</span>
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-xs font-semibold text-slate-200 m-0 mb-0.5">Status</h3>
                      <div className="text-sm text-slate-400">
                        {status}
                      </div>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {completedFilePath && (
                      <motion.button
                        onClick={handleGoToFile}
                        className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white py-2 px-4 rounded-lg border-none text-xs font-medium cursor-pointer shadow-lg shadow-emerald-500/30"
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        whileHover={{ 
                          y: -2, 
                          scale: 1.05,
                          boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        📁 Go to File
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 pb-6 w-full box-border">
          <AnimatePresence mode="wait">
            {activeTab === 'video' && (
              <motion.div
                key="video"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <VideoTab onProcessingStart={handleProcessingStart} />
              </motion.div>
            )}
            {activeTab === 'audio' && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <AudioTab onProcessingStart={handleProcessingStart} />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <SettingsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;
