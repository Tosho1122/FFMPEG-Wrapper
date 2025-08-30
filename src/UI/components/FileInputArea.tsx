import { useState, useCallback } from 'react';

interface FileInputAreaProps {
  onFileSelect: (filePath: string) => void;
  acceptedTypes?: string;
  label?: string;
  selectedFile?: string | null;
}

export default function FileInputArea({ 
  onFileSelect, 
  label = "Drag file here or click to browse",
  selectedFile 
}: FileInputAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = useCallback(async () => {
    if (!window.electronAPI) return;
    
    const filePath = await window.electronAPI.selectInputFile();
    if (filePath) {
      onFileSelect(filePath);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0] as any;
      const filePath = file.path || file.name;
      onFileSelect(filePath);
    }
  }, [onFileSelect]);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: '100%',
        height: '80px',
        border: `2px dashed ${isDragOver ? '#3b82f6' : 'rgba(71, 85, 105, 0.4)'}`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isDragOver 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'rgba(15, 23, 42, 0.2)',
        backgroundImage: isDragOver 
          ? 'none'
          : 'radial-gradient(circle at 20px 20px, rgba(71, 85, 105, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}
      onMouseEnter={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = '#64748b';
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.4)';
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.2)';
        }
      }}
    >
      {selectedFile ? (
        <div style={{ textAlign: 'center', padding: '0 16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
            Selected:
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
            {selectedFile.split('\\').pop() || selectedFile}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg 
            width="24" 
            height="24" 
            fill="none" 
            stroke="#64748b" 
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12"/>
            <path d="M9 15l3-3 3 3"/>
            <path d="M12 12v9"/>
          </svg>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>{label}</div>
        </div>
      )}
    </div>
  );
}