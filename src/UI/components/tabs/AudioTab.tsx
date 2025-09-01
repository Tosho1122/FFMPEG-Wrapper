import { useState } from 'react';
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

  const generateDefaultOutputPath = (inputPath: string, ext: string) => {
    const parts = inputPath.split('\\');
    const fileName = parts.pop()?.split('.')[0] || 'output';
    const directory = parts.join('\\') || '.';
    const suffix = operation === 'convert' ? '_converted' : '_extracted';
    return `${directory}\\${fileName}${suffix}.${ext}`;
  };

  const handleInputFileSelect = (filePath: string) => {
    setInputFile(filePath);
    // Auto-generate default output path
    const defaultOutput = generateDefaultOutputPath(filePath, format);
    setOutputFile(defaultOutput);
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
              label="Click to select video or audio file"
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

        {/* Preview Settings */}
        <div className={glassClassName}>
          <div className="p-5">
            <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
              Preview Settings
            </h3>
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Operation:</span>
                <span className="text-slate-200 text-xs font-medium">
                  {operation === 'convert' ? 'Audio Conversion' : 'Audio Extraction from Video'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Format:</span>
                <span className="text-slate-200 text-xs font-medium">{format.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Quality:</span>
                <span className="text-slate-200 text-xs font-medium">{quality} kbps</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Sample Rate:</span>
                <span className="text-slate-200 text-xs font-medium">{parseInt(sampleRate).toLocaleString()} Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartProcessing}
          disabled={!inputFile}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 ${
            !inputFile
              ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/25 active:translate-y-0 shadow-lg shadow-blue-600/30'
          }`}
        >
          🎵 Start {operation === 'convert' ? 'Converting' : 'Extracting'} Audio
        </button>
      </div>

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
      `}</style>
    </div>
  );
}