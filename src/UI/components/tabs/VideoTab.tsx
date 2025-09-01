import { useState, useEffect } from 'react';
import FileInputArea from '../FileInputArea';
import OutputSelector from '../OutputSelector';

interface VideoTabProps {
  onProcessingStart?: (operation: string, inputFile: string, outputFile: string, options: any) => void;
}

export default function VideoTab({ onProcessingStart }: VideoTabProps) {
  const [inputFile, setInputFile] = useState<string | null>(null);
  const [outputFile, setOutputFile] = useState<string | null>(null);
  const [operation, setOperation] = useState<'convert' | 'compress'>('convert');
  const [format, setFormat] = useState<string>('mp4');
  const [quality, setQuality] = useState<string>('23');
  const [resolution, setResolution] = useState<string>('original');
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [bitrate, setBitrate] = useState<string>('');
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [loadingMediaInfo, setLoadingMediaInfo] = useState(false);

  const generateDefaultOutputPath = (inputPath: string, ext: string) => {
    const parts = inputPath.split('\\');
    const fileName = parts.pop()?.split('.')[0] || 'output';
    const directory = parts.join('\\') || '.';
    const suffix = operation === 'convert' ? '_converted' : '_compressed';
    return `${directory}\\${fileName}${suffix}.${ext}`;
  };

  const handleInputFileSelect = async (filePath: string) => {
    setInputFile(filePath);
    setMediaInfo(null);
    setThumbnailPath(null);
    
    // Auto-generate default output path
    const ext = operation === 'convert' ? format : 'mp4';
    const defaultOutput = generateDefaultOutputPath(filePath, ext);
    setOutputFile(defaultOutput);

    // Load media info
    setLoadingMediaInfo(true);
    try {
      const info = await window.electronAPI.getMediaInfo(filePath);
      setMediaInfo(info);
      
      // Generate thumbnail for video files
      if (info.width && info.height) {
        try {
          const thumbPath = await window.electronAPI.generateThumbnail(filePath);
          setThumbnailPath(thumbPath);
        } catch (thumbError) {
          console.warn('Failed to generate thumbnail:', thumbError);
        }
      }
    } catch (error) {
      console.error('Failed to get media info:', error);
    } finally {
      setLoadingMediaInfo(false);
    }
  };

  useEffect(() => {
    if (!inputFile) {
      setMediaInfo(null);
      setThumbnailPath(null);
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
    const finalOutputFile = outputFile || generateDefaultOutputPath(inputFile, operation === 'convert' ? format : 'mp4');

    const options: any = {};
    
    if (operation === 'convert') {
      options.format = format;
      
      if (resolution !== 'original') {
        if (resolution === 'custom') {
          if (customWidth && customHeight) {
            options.width = parseInt(customWidth);
            options.height = parseInt(customHeight);
          }
        } else {
          const [width, height] = resolution.split('x').map(Number);
          options.width = width;
          options.height = height;
        }
      }
      
      if (bitrate) {
        options.bitrate = bitrate;
      }
    } else if (operation === 'compress') {
      options.quality = quality;
    }

    onProcessingStart(operation, inputFile, finalOutputFile, options);
  };

  const glassClassName = "bg-slate-800/70 backdrop-blur-[10px] border border-slate-600/30 rounded-2xl shadow-2xl";
  const inputClassName = "bg-slate-900/50 border border-slate-600/40 rounded-xl py-3 px-4 text-slate-200 text-sm transition-all duration-200 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
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
                <div className="flex gap-6">
                  {/* Thumbnail - Small Square */}
                  {thumbnailPath && (
                    <div className="flex-shrink-0">
                      <img 
                        src={`file://${thumbnailPath}`} 
                        alt="Video thumbnail"
                        className="w-24 h-24 rounded-lg border border-slate-600/40 object-cover"
                      />
                    </div>
                  )}

                  {/* Media Properties */}
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Duration:</span>
                      <span className="text-slate-200 text-xs font-medium">{formatDuration(mediaInfo.duration)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Format:</span>
                      <span className="text-slate-200 text-xs font-medium">{mediaInfo.format || 'Unknown'}</span>
                    </div>

                    {mediaInfo.width && mediaInfo.height && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Resolution:</span>
                        <span className="text-slate-200 text-xs font-medium">{mediaInfo.width}x{mediaInfo.height}</span>
                      </div>
                    )}

                    {mediaInfo.videoCodec && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Video Codec:</span>
                        <span className="text-slate-200 text-xs font-medium">{mediaInfo.videoCodec.toUpperCase()}</span>
                      </div>
                    )}

                    {mediaInfo.frameRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Frame Rate:</span>
                        <span className="text-slate-200 text-xs font-medium">{mediaInfo.frameRate} fps</span>
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
              </div>
            ) : null
          ) : null}
          
          <div className="flex flex-col gap-4">
            {/* File Input - Shorter Height */}
            <div className="h-20">
              <FileInputArea
                onFileSelect={handleInputFileSelect}
                label="Click to select video file"
                selectedFile={inputFile}
              />
            </div>
            
            {/* Placeholder when no file selected */}
            {!inputFile && (
              <div className="p-5 flex items-center justify-center border-2 border-dashed border-slate-600/40 rounded-xl">
                <span className="text-slate-400 text-sm">Select a video file to view media information</span>
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
                      : 'border-slate-600 bg-transparent hover:border-blue-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                  }`}
                />
                <span className="text-slate-200 text-sm">Convert Video</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="compress"
                  checked={operation === 'compress'}
                  onChange={(e) => setOperation(e.target.value as 'compress')}
                  className={`appearance-none w-[18px] h-[18px] rounded-full mr-2 relative transition-all duration-200 border-2 ${
                    operation === 'compress' 
                      ? 'border-blue-500 bg-blue-500 shadow-[inset_0_0_0_3px_#0f172a]' 
                      : 'border-slate-600 bg-transparent hover:border-blue-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                  }`}
                />
                <span className="text-slate-200 text-sm">Compress Video</span>
              </label>
            </div>

            {/* Convert Options */}
            {operation === 'convert' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">
                    Output Format
                  </label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectClassName}>
                    <option value="mp4">MP4</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                    <option value="webm">WebM</option>
                    <option value="mkv">MKV</option>
                    <option value="wmv">WMV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">
                    Resolution
                  </label>
                  <select value={resolution} onChange={(e) => setResolution(e.target.value)} className={selectClassName}>
                    <option value="original">Keep Original</option>
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                    <option value="1280x720">1280x720 (HD)</option>
                    <option value="854x480">854x480 (480p)</option>
                    <option value="640x360">640x360 (360p)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {resolution === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Width</label>
                      <input
                        type="number"
                        placeholder="1920"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Height</label>
                      <input
                        type="number"
                        placeholder="1080"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">
                    Video Bitrate (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1000k"
                    value={bitrate}
                    onChange={(e) => setBitrate(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            )}

            {/* Compress Options */}
            {operation === 'compress' && (
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Quality (CRF)
                </label>
                <div className="mb-2">
                  <input
                    type="range"
                    min="18"
                    max="32"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>18 (Best)</span>
                    <span className="font-medium text-blue-400">{quality}</span>
                    <span>32 (Smallest)</span>
                  </div>
                </div>
              </div>
            )}
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
                defaultExtension={operation === 'convert' ? format : 'mp4'}
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
              {operation === 'convert' ? '🎬 Start Converting Video' : '🗜️ Start Compressing Video'}
            </button>
          </div>
        </div>
      )}
      
      {/* Bottom padding to prevent content from being hidden behind sticky button */}
      {inputFile && <div className="h-20"></div>}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
        }
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