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

  const handleStartProcessing = () => {
    if (!inputFile || !outputFile || !onProcessingStart) return;

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
    onProcessingStart(actualOperation, inputFile, outputFile, options);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Input File</h3>
          <FileInputArea
            onFileSelect={setInputFile}
            acceptedTypes="video/*,audio/*"
            label="Drag video or audio file here or click to browse"
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
                Convert Audio
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="extract"
                  checked={operation === 'extract'}
                  onChange={(e) => setOperation(e.target.value as 'extract')}
                  className="mr-2"
                />
                Extract Audio from Video
              </label>
            </div>

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
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="flac">FLAC</option>
                  <option value="aac">AAC</option>
                  <option value="ogg">OGG</option>
                  <option value="m4a">M4A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Quality (kbps)
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="64">64 kbps (Low)</option>
                  <option value="128">128 kbps (Standard)</option>
                  <option value="192">192 kbps (High)</option>
                  <option value="256">256 kbps (Very High)</option>
                  <option value="320">320 kbps (Maximum)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Rate (Hz)
                </label>
                <select
                  value={sampleRate}
                  onChange={(e) => setSampleRate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
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

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Output Settings</h3>
          <OutputSelector
            inputFile={inputFile}
            outputFile={outputFile}
            onOutputFileChange={setOutputFile}
            defaultExtension={format}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Preview Settings</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Operation:</strong> {operation === 'convert' ? 'Audio Conversion' : 'Audio Extraction from Video'}</div>
              <div><strong>Format:</strong> {format.toUpperCase()}</div>
              <div><strong>Quality:</strong> {quality} kbps</div>
              <div><strong>Sample Rate:</strong> {parseInt(sampleRate).toLocaleString()} Hz</div>
            </div>
          </div>
          
          <button
            onClick={handleStartProcessing}
            disabled={!inputFile || !outputFile}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Start {operation === 'convert' ? 'Converting' : 'Extracting'} Audio
          </button>
        </div>
      </div>
    </div>
  );
}