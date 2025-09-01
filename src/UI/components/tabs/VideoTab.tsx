import { useState } from 'react';
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

  const generateDefaultOutputPath = (inputPath: string, ext: string) => {
    const parts = inputPath.split('\\');
    const fileName = parts.pop()?.split('.')[0] || 'output';
    const directory = parts.join('\\') || '.';
    const suffix = operation === 'convert' ? '_converted' : '_compressed';
    return `${directory}\\${fileName}${suffix}.${ext}`;
  };

  const handleInputFileSelect = (filePath: string) => {
    setInputFile(filePath);
    // Auto-generate default output path
    const ext = operation === 'convert' ? format : 'mp4';
    const defaultOutput = generateDefaultOutputPath(filePath, ext);
    setOutputFile(defaultOutput);
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
    <div className="grid grid-cols-2 gap-6 items-start">
      {/* Left Side - Input and Operations */}
      <div className="flex flex-col gap-5">
        {/* Input File Section */}
        <div className={glassClassName}>
          <div className="p-5">
            <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
              Input File
            </h3>
            <FileInputArea
              onFileSelect={handleInputFileSelect}
              label="Click to select video file"
              selectedFile={inputFile}
            />
          </div>
        </div>

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

      {/* Right Side - Output and Process */}
      <div className="flex flex-col gap-5">
        {/* Output Section */}
        <div className={glassClassName}>
          <div className="p-5">
            <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
              Output File
            </h3>
            <OutputSelector
              outputFile={outputFile}
              onOutputFileChange={setOutputFile}
              defaultExtension={operation === 'convert' ? format : 'mp4'}
            />
          </div>
        </div>

        {/* Process Button */}
        <div className={glassClassName}>
          <div className="p-5">
            <button
              onClick={handleStartProcessing}
              disabled={!inputFile}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 ${
                !inputFile
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/25 active:translate-y-0'
              }`}
            >
              {operation === 'convert' ? '🎬 Convert Video' : '🗜️ Compress Video'}
            </button>
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}