import { useState } from 'react';

interface OutputSelectorProps {
  outputFile?: string | null;
  onOutputFileChange: (filePath: string) => void;
  onOutputDirectoryChange?: (dirPath: string) => void;
  defaultExtension?: string;
}

export default function OutputSelector({ 
  outputFile, 
  onOutputFileChange,
  onOutputDirectoryChange,
  defaultExtension = 'mp4'
}: OutputSelectorProps) {
  const [outputDirectory, setOutputDirectory] = useState<string>('');
  const [outputFileName, setOutputFileName] = useState<string>('');


  const handleSelectDirectory = async () => {
    if (!window.electronAPI) return;
    
    const dirPath = await window.electronAPI.selectDirectory();
    if (dirPath) {
      setOutputDirectory(dirPath);
      if (onOutputDirectoryChange) {
        onOutputDirectoryChange(dirPath);
      }
      
      if (outputFileName) {
        const fullPath = `${dirPath}\\${outputFileName}`;
        onOutputFileChange(fullPath);
      }
    }
  };

  const handleFileNameChange = (fileName: string) => {
    setOutputFileName(fileName);
    if (outputDirectory) {
      const fullPath = `${outputDirectory}\\${fileName}`;
      onOutputFileChange(fullPath);
    }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
          Output File Name
        </label>
        <input
          type="text"
          value={outputFileName}
          onChange={(e) => handleFileNameChange(e.target.value)}
          placeholder={`output.${defaultExtension}`}
          style={inputStyle}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
          Output Directory
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={outputDirectory}
            readOnly
            placeholder="Will create 'output' folder in working directory if not set"
            style={{
              ...inputStyle,
              flex: 1,
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              cursor: 'not-allowed'
            }}
          />
          <button
            onClick={handleSelectDirectory}
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
            }}
          >
            Browse
          </button>
        </div>
      </div>
      
      {outputFile && (
        <div 
          style={{
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(71, 85, 105, 0.2)'
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
            <strong>Full Output Path:</strong>
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '13px', wordBreak: 'break-all' }}>
            {outputFile}
          </div>
        </div>
      )}
    </div>
  );
}