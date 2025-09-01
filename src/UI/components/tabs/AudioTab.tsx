import { useState, useEffect } from 'react';
import FileInputArea from '../FileInputArea';
import OutputSelector from '../OutputSelector';

interface AudioTabProps {
  onProcessingStart?: (operation: string, inputFile: string, outputFile: string, options: any) => void;
}

export default function AudioTab({ onProcessingStart }: AudioTabProps) {
  const [inputFile, setInputFile] = useState<string | null>(null);
  const [outputFile, setOutputFile] = useState<string | null>(null);
  const [operation, setOperation] = useState<'convert' | 'extract'>('convert');
  const [format, setFormat] = useState<string>('mp3');
  const [quality, setQuality] = useState<string>('192');
  const [sampleRate, setSampleRate] = useState<string>('44100');
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [loadingMediaInfo, setLoadingMediaInfo] = useState(false);

  const generateDefaultOutputPath = (inputPath: string, ext: string) => {
    const parts = inputPath.split('\\');
    const fileName = parts.pop()?.split('.')[0] || 'output';
    const directory = parts.join('\\') || '.';
    const suffix = operation === 'convert' ? '_converted' : '_extracted';
    return `${directory}\\${fileName}${suffix}.${ext}`;
  };

  const handleInputFileSelect = async (filePath: string) => {
    setInputFile(filePath);
    setMediaInfo(null);
    
    // Auto-generate default output path
    const defaultOutput = generateDefaultOutputPath(filePath, format);
    setOutputFile(defaultOutput);

    // Load media info
    setLoadingMediaInfo(true);
    try {
      const info = await window.electronAPI.getMediaInfo(filePath);
      setMediaInfo(info);
    } catch (error) {
      console.error('Failed to get media info:', error);
    } finally {
      setLoadingMediaInfo(false);
    }
  };

  useEffect(() => {
    if (!inputFile) {
      setMediaInfo(null);
    }
  }, [inputFile]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatBitrate = (bitrate?: number): string => {
    if (!bitrate) return 'Unknown';
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    }
    return `${Math.round(bitrate / 1000)} kbps`;
  };

  const handleStartProcessing = () => {
    if (!inputFile || !onProcessingStart) return;

    // Use provided output file or generate default
    const finalOutputFile = outputFile || generateDefaultOutputPath(inputFile, format);

    const options: any = {};
    
    if (operation === 'convert') {
      options.format = format;
      options.audioBitrate = quality + 'k';
      options.sampleRate = parseInt(sampleRate);
    } else if (operation === 'extract') {
      options.format = format;
      options.audioBitrate = quality + 'k';
      options.sampleRate = parseInt(sampleRate);
    }

    const actualOperation = operation === 'convert' ? 'convertAudio' : 'extract-audio';
    onProcessingStart(actualOperation, inputFile, finalOutputFile, options);
  };

  const glassClassName = "bg-slate-800/70 backdrop-blur-[10px] border border-slate-600/30 rounded-2xl shadow-2xl";
  const selectClassName = "bg-slate-900/50 border border-slate-600/40 rounded-xl py-3 px-4 pr-10 text-slate-200 text-sm transition-all duration-200 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer bg-[url('data:image/svg+xml,%3csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 20 20\\'%3e%3cpath stroke=\\'%236b7280\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1.5\\' d=\\'m6 8 4 4 4-4\\'/%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat";

  return (
    <div className="flex flex-col gap-6">
      {/* Combined Input File and Media Information Section - Full Width */}
      <div className={glassClassName}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
            Input File & Media Information
          </h3>
          
          {/* Media Information Text - Right after header */}
          {inputFile ? (
            loadingMediaInfo ? (
              <div className="flex items-center py-4 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-slate-400 text-sm">Loading media info...</span>
              </div>
            ) : mediaInfo ? (
              <div className="mb-4">
                {/* Media Properties */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs">Duration:</span>
                    <span className="text-slate-200 text-xs font-medium">{formatDuration(mediaInfo.duration)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs">Format:</span>
                    <span className="text-slate-200 text-xs font-medium">{mediaInfo.format || 'Unknown'}</span>
                  </div>

                  {mediaInfo.audioCodec && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Audio Codec:</span>
                      <span className="text-slate-200 text-xs font-medium">{mediaInfo.audioCodec.toUpperCase()}</span>
                    </div>
                  )}

                  {mediaInfo.sampleRate && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Sample Rate:</span>
                      <span className="text-slate-200 text-xs font-medium">{mediaInfo.sampleRate.toLocaleString()} Hz</span>
                    </div>
                  )}

                  {mediaInfo.channels && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Channels:</span>
                      <span className="text-slate-200 text-xs font-medium">
                        {mediaInfo.channels} {mediaInfo.channels === 1 ? '(Mono)' : mediaInfo.channels === 2 ? '(Stereo)' : ''}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs">Bitrate:</span>
                    <span className="text-slate-200 text-xs font-medium">{formatBitrate(mediaInfo.bitrate)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs">File Size:</span>
                    <span className="text-slate-200 text-xs font-medium">{formatFileSize(mediaInfo.size)}</span>
                  </div>
                </div>
              </div>
            ) : null
          ) : null}
          
          <div className="flex flex-col gap-4">
            {/* File Input - Shorter Height */}
            <div className="h-20">
              <FileInputArea
                onFileSelect={handleInputFileSelect}
                label="Click to select video or audio file"
                selectedFile={inputFile}
              />
            </div>
            
            {/* Placeholder when no file selected */}
            {!inputFile && (
              <div className="p-5 flex items-center justify-center border-2 border-dashed border-slate-600/40 rounded-xl">
                <span className="text-slate-400 text-sm">Select an audio or video file to view media information</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Left Side - Operations */}
        <div className="flex flex-col gap-5">
          {/* Operation Type Section */}
          <div className={glassClassName}>
            <div className="p-5">
              <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
                Operation Type
              </h3>
            
            {/* Radio Buttons */}
            <div className="flex gap-4 mb-5">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="convert"
                  checked={operation === 'convert'}
                  onChange={(e) => setOperation(e.target.value as 'convert')}
                  className={`appearance-none w-[18px] h-[18px] rounded-full mr-2 relative transition-all duration-200 border-2 ${
                    operation === 'convert' 
                      ? 'border-blue-500 bg-blue-500 shadow-[inset_0_0_0_3px_#0f172a]' 
                      : 'border-slate-600 bg-transparent hover:border-blue-500 focus:border-blue-500'
                  }`}
                />
                <span className="text-slate-200 text-sm">Convert Audio</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="extract"
                  checked={operation === 'extract'}
                  onChange={(e) => setOperation(e.target.value as 'extract')}
                  className={`appearance-none w-[18px] h-[18px] rounded-full mr-2 relative transition-all duration-200 border-2 ${
                    operation === 'extract' 
                      ? 'border-blue-500 bg-blue-500 shadow-[inset_0_0_0_3px_#0f172a]' 
                      : 'border-slate-600 bg-transparent hover:border-blue-500 focus:border-blue-500'
                  }`}
                />
                <span className="text-slate-200 text-sm">Extract Audio from Video</span>
              </label>
            </div>

            {/* Audio Options */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Output Format
                </label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectClassName}>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="flac">FLAC</option>
                  <option value="aac">AAC</option>
                  <option value="ogg">OGG</option>
                  <option value="m4a">M4A</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Audio Quality (kbps)
                </label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)} className={selectClassName}>
                  <option value="64">64 kbps (Low)</option>
                  <option value="128">128 kbps (Standard)</option>
                  <option value="192">192 kbps (High)</option>
                  <option value="256">256 kbps (Very High)</option>
                  <option value="320">320 kbps (Maximum)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Sample Rate (Hz)
                </label>
                <select value={sampleRate} onChange={(e) => setSampleRate(e.target.value)} className={selectClassName}>
                  <option value="22050">22.05 kHz</option>
                  <option value="44100">44.1 kHz (CD Quality)</option>
                  <option value="48000">48 kHz (Professional)</option>
                  <option value="96000">96 kHz (High Resolution)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Right Side - Output Settings and Preview */}
        <div className="flex flex-col gap-5">
          <div className={glassClassName}>
            <div className="p-5">
              <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
                Output Settings
              </h3>
              <OutputSelector
                outputFile={outputFile}
                onOutputFileChange={setOutputFile}
                defaultExtension={format}
              />
            </div>
          </div>


        </div>
      </div>
      
      {/* Sticky Bottom Button - Pops up when eligible */}
      {inputFile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-600/30 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleStartProcessing}
              className="w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/25 active:translate-y-0 shadow-lg shadow-blue-600/30"
            >
              🎵 Start {operation === 'convert' ? 'Converting' : 'Extracting'} Audio
            </button>
          </div>
        </div>
      )}
      
      {/* Bottom padding to prevent content from being hidden behind sticky button */}
      {inputFile && <div className="h-20"></div>}

      <style>{`
        select option {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 8px 12px;
        }
        select option:hover {
          background-color: #334155;
        }
        select option:checked {
          background-color: #3b82f6;
          color: white;
        }
        
        /* Custom Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.2);
          border-radius: 4px;
          transition: all 0.3s ease;
          border: 1px solid rgba(71, 85, 105, 0.1);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.5);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:active {
          background: rgba(71, 85, 105, 0.7);
          border: 1px solid rgba(71, 85, 105, 0.5);
        }
        
        /* Auto-hide behavior using body hover */
        body:not(:hover) ::-webkit-scrollbar-thumb {
          background: transparent;
          border: none;
        }
        
        /* Firefox scrollbar styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(71, 85, 105, 0.3) transparent;
        }
      `}</style>
    </div>
  );
}