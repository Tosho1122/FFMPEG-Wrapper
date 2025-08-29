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

  const handleStartProcessing = () => {
    if (!inputFile || !outputFile || !onProcessingStart) return;

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

    onProcessingStart(operation, inputFile, outputFile, options);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Input File</h3>
          <FileInputArea
            onFileSelect={setInputFile}
            acceptedTypes="video/*"
            label="Drag video file here or click to browse"
            selectedFile={inputFile}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Operation Type</h3>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="convert"
                  checked={operation === 'convert'}
                  onChange={(e) => setOperation(e.target.value as 'convert')}
                  className="mr-2"
                />
                Convert Video
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="compress"
                  checked={operation === 'compress'}
                  onChange={(e) => setOperation(e.target.value as 'compress')}
                  className="mr-2"
                />
                Compress Video
              </label>
            </div>

            {operation === 'convert' && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mp4">MP4</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                    <option value="webm">WebM</option>
                    <option value="mkv">MKV</option>
                    <option value="wmv">WMV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="original">Keep Original</option>
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                    <option value="1280x720">1280x720 (HD)</option>
                    <option value="854x480">854x480 (480p)</option>
                    <option value="640x360">640x360 (360p)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {resolution === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Width</label>
                      <input
                        type="number"
                        placeholder="1920"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height</label>
                      <input
                        type="number"
                        placeholder="1080"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Bitrate (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1000k"
                    value={bitrate}
                    onChange={(e) => setBitrate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for auto. Use format like "1000k" or "2M"
                  </p>
                </div>
              </div>
            )}

            {operation === 'compress' && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality (CRF)
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="51"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Best Quality (18)</span>
                    <span>Current: {quality}</span>
                    <span>Smallest File (51)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Output Settings</h3>
          <OutputSelector
            inputFile={inputFile}
            outputFile={outputFile}
            onOutputFileChange={setOutputFile}
            defaultExtension={operation === 'convert' ? format : 'mp4'}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={handleStartProcessing}
            disabled={!inputFile || !outputFile}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Start {operation === 'convert' ? 'Converting' : 'Compressing'}
          </button>
        </div>
      </div>
    </div>
  );
}