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
              acceptedTypes="video/*"
              label="Drag video file here or click to browse"
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    if (operation !== 'convert') {
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (operation !== 'convert') {
                      e.currentTarget.style.borderColor = '#475569';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
                <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Convert Video</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="compress"
                  checked={operation === 'compress'}
                  onChange={(e) => setOperation(e.target.value as 'compress')}
                  style={{
                    appearance: 'none',
                    width: '18px',
                    height: '18px',
                    border: `2px solid ${operation === 'compress' ? '#3b82f6' : '#475569'}`,
                    borderRadius: '50%',
                    marginRight: '8px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    backgroundColor: operation === 'compress' ? '#3b82f6' : 'transparent',
                    boxShadow: operation === 'compress' 
                      ? 'inset 0 0 0 3px #0f172a' 
                      : 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    if (operation !== 'compress') {
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (operation !== 'compress') {
                      e.currentTarget.style.borderColor = '#475569';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
                <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Compress Video</span>
              </label>
            </div>

            {/* Convert Options */}
            {operation === 'convert' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Output Format
                  </label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} style={selectStyle}>
                    <option value="mp4">MP4</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                    <option value="webm">WebM</option>
                    <option value="mkv">MKV</option>
                    <option value="wmv">WMV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Resolution
                  </label>
                  <select value={resolution} onChange={(e) => setResolution(e.target.value)} style={selectStyle}>
                    <option value="original">Keep Original</option>
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                    <option value="1280x720">1280x720 (HD)</option>
                    <option value="854x480">854x480 (480p)</option>
                    <option value="640x360">640x360 (360p)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {resolution === 'custom' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Width</label>
                      <input
                        type="number"
                        placeholder="1920"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Height</label>
                      <input
                        type="number"
                        placeholder="1080"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Video Bitrate (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1000k"
                    value={bitrate}
                    onChange={(e) => setBitrate(e.target.value)}
                    style={inputStyle}
                  />
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
                    Leave empty for auto. Use format like "1000k" or "2M"
                  </p>
                </div>
              </div>
            )}

            {/* Compress Options */}
            {operation === 'compress' && (
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
                  Quality (CRF)
                </label>
                <input
                  type="range"
                  min="18"
                  max="51"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'linear-gradient(to right, #10b981 0%, #3b82f6 50%, #ef4444 100%)',
                    outline: 'none',
                    appearance: 'none'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>Best Quality (18)</span>
                  <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '500' }}>Current: {quality}</span>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>Smallest File (51)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Output Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={glassStyle}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
              Output Settings
            </h3>
            <OutputSelector
              outputFile={outputFile}
              onOutputFileChange={setOutputFile}
              defaultExtension={operation === 'convert' ? format : 'mp4'}
            />
          </div>
        </div>

        {/* Start Button under Output */}
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
          Start {operation === 'convert' ? 'Converting' : 'Compressing'}
        </button>
      </div>
      </div>
    </>
  );
}