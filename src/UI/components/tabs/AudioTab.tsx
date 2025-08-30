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

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
  };

  const inputStyle = {
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(71, 85, 105, 0.4)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#e2e8f0',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none'
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px',
    cursor: 'pointer'
  };

  return (
    <>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Side - Input and Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Input File Section */}
          <div style={glassStyle}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
                Input File
              </h3>
              <FileInputArea
                onFileSelect={handleInputFileSelect}
                acceptedTypes="video/*,audio/*"
                label="Drag video or audio file here or click to browse"
                selectedFile={inputFile}
              />
            </div>
          </div>

          {/* Operation Type Section */}
          <div style={glassStyle}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
                Operation Type
              </h3>
              
              {/* Radio Buttons */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="convert"
                    checked={operation === 'convert'}
                    onChange={(e) => setOperation(e.target.value as 'convert')}
                    style={{
                      appearance: 'none',
                      width: '18px',
                      height: '18px',
                      border: `2px solid ${operation === 'convert' ? '#3b82f6' : '#475569'}`,
                      borderRadius: '50%',
                      marginRight: '8px',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      backgroundColor: operation === 'convert' ? '#3b82f6' : 'transparent',
                      boxShadow: operation === 'convert' 
                        ? 'inset 0 0 0 3px #0f172a' 
                        : 'none'
                    }}
                  />
                  <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Convert Audio</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="extract"
                    checked={operation === 'extract'}
                    onChange={(e) => setOperation(e.target.value as 'extract')}
                    style={{
                      appearance: 'none',
                      width: '18px',
                      height: '18px',
                      border: `2px solid ${operation === 'extract' ? '#3b82f6' : '#475569'}`,
                      borderRadius: '50%',
                      marginRight: '8px',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      backgroundColor: operation === 'extract' ? '#3b82f6' : 'transparent',
                      boxShadow: operation === 'extract' 
                        ? 'inset 0 0 0 3px #0f172a' 
                        : 'none'
                    }}
                  />
                  <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Extract Audio from Video</span>
                </label>
              </div>

              {/* Audio Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Output Format
                  </label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} style={selectStyle}>
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                    <option value="flac">FLAC</option>
                    <option value="aac">AAC</option>
                    <option value="ogg">OGG</option>
                    <option value="m4a">M4A</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Audio Quality (kbps)
                  </label>
                  <select value={quality} onChange={(e) => setQuality(e.target.value)} style={selectStyle}>
                    <option value="64">64 kbps (Low)</option>
                    <option value="128">128 kbps (Standard)</option>
                    <option value="192">192 kbps (High)</option>
                    <option value="256">256 kbps (Very High)</option>
                    <option value="320">320 kbps (Maximum)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Sample Rate (Hz)
                  </label>
                  <select value={sampleRate} onChange={(e) => setSampleRate(e.target.value)} style={selectStyle}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={glassStyle}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
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
          <div style={glassStyle}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
                Preview Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Operation:</span>
                  <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500' }}>
                    {operation === 'convert' ? 'Audio Conversion' : 'Audio Extraction from Video'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Format:</span>
                  <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500' }}>{format.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Quality:</span>
                  <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500' }}>{quality} kbps</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Sample Rate:</span>
                  <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '500' }}>{parseInt(sampleRate).toLocaleString()} Hz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartProcessing}
            disabled={!inputFile}
            style={{
              background: !inputFile 
                ? 'rgba(71, 85, 105, 0.5)' 
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: !inputFile ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: !inputFile 
                ? 'none' 
                : '0 4px 14px rgba(59, 130, 246, 0.3)',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              if (inputFile) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputFile) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            Start {operation === 'convert' ? 'Converting' : 'Extracting'} Audio
          </button>
        </div>
      </div>
    </>
  );
}