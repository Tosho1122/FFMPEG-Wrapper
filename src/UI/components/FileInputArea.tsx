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
      className={`
        w-full h-32 border-2 border-dashed rounded-lg 
        flex flex-col items-center justify-center 
        cursor-pointer transition-colors
        ${isDragOver 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
      `}
    >
      {selectedFile ? (
        <div className="text-center px-4">
          <div className="text-sm font-medium text-gray-700">Selected:</div>
          <div className="text-xs text-gray-500 truncate max-w-full">
            {selectedFile.split('\\').pop() || selectedFile}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <svg 
            className="mx-auto h-8 w-8 text-gray-400 mb-2" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      )}
    </div>
  );
}