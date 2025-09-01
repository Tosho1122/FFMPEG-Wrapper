import { useCallback } from 'react';

interface FileInputAreaProps {
  onFileSelect: (filePath: string) => void;
  label?: string;
  selectedFile?: string | null;
}

export default function FileInputArea({ 
  onFileSelect, 
  label = "Click to select file",
  selectedFile 
}: FileInputAreaProps) {
  const handleClick = useCallback(async () => {
    if (!window.electronAPI) return;
    
    const filePath = await window.electronAPI.selectInputFile();
    if (filePath) {
      onFileSelect(filePath);
    }
  }, [onFileSelect]);

  return (
    <div
      onClick={handleClick}
      className="w-full h-20 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 border-slate-600/40 bg-slate-900/20 hover:border-slate-500 hover:bg-slate-900/30 [background-image:radial-gradient(circle_at_20px_20px,_rgba(71,85,105,0.1)_1px,_transparent_1px)] [background-size:40px_40px]"
    >
      {selectedFile ? (
        <div className="text-center px-4">
          <div className="text-xs font-semibold text-emerald-500 mb-1">
            Selected:
          </div>
          <div className="text-[11px] text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
            {selectedFile.split('\\').pop() || selectedFile}
          </div>
        </div>
      ) : (
        <div className="text-center flex items-center gap-3">
          <svg 
            width="24" 
            height="24" 
            fill="none" 
            className="stroke-slate-500" 
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12"/>
            <path d="M9 15l3-3 3 3"/>
            <path d="M12 12v9"/>
          </svg>
          <div className="text-sm text-slate-400">{label}</div>
        </div>
      )}
    </div>
  );
}