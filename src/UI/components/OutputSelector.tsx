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

  const inputClassName = "bg-slate-900/50 border border-slate-600/40 rounded-xl py-3 px-4 text-slate-200 text-sm transition-all duration-200 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-slate-400 text-xs mb-1.5">
          Output File Name
        </label>
        <input
          type="text"
          value={outputFileName}
          onChange={(e) => handleFileNameChange(e.target.value)}
          placeholder={`output.${defaultExtension}`}
          className={inputClassName}
        />
      </div>
      
      <div>
        <label className="block text-slate-400 text-xs mb-1.5">
          Output Directory
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={outputDirectory}
            readOnly
            placeholder="Will create 'output' folder in working directory if not set"
            className={`${inputClassName} flex-1 bg-slate-900/30 cursor-not-allowed`}
          />
          <button
            onClick={handleSelectDirectory}
            className="bg-blue-500/80 hover:bg-blue-500 text-white py-3 px-4 rounded-xl border-none text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap"
          >
            Browse
          </button>
        </div>
      </div>
      
      {outputFile && (
        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-600/20">
          <div className="text-slate-400 text-xs mb-1">
            <strong>Full Output Path:</strong>
          </div>
          <div className="text-slate-200 text-xs break-all">
            {outputFile}
          </div>
        </div>
      )}
    </div>
  );
}