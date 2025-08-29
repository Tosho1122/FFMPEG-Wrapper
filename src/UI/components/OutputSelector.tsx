import { useState } from 'react';

interface OutputSelectorProps {
  inputFile?: string | null;
  outputFile?: string | null;
  onOutputFileChange: (filePath: string) => void;
  onOutputDirectoryChange?: (dirPath: string) => void;
  defaultExtension?: string;
}

export default function OutputSelector({ 
  inputFile, 
  outputFile, 
  onOutputFileChange,
  onOutputDirectoryChange,
  defaultExtension = 'mp4'
}: OutputSelectorProps) {
  const [outputDirectory, setOutputDirectory] = useState<string>('');
  const [outputFileName, setOutputFileName] = useState<string>('');

  const handleSelectOutputFile = async () => {
    if (!window.electronAPI || !inputFile) return;
    
    const baseFileName = inputFile.split('\\').pop()?.split('.')[0] || 'output';
    const defaultName = `${baseFileName}_converted.${defaultExtension}`;
    
    const filePath = await window.electronAPI.selectOutputFile(defaultName);
    if (filePath) {
      onOutputFileChange(filePath);
      
      const parts = filePath.split('\\');
      const fileName = parts.pop() || '';
      const directory = parts.join('\\');
      
      setOutputFileName(fileName);
      setOutputDirectory(directory);
      
      if (onOutputDirectoryChange) {
        onOutputDirectoryChange(directory);
      }
    }
  };

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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output File Name
        </label>
        <input
          type="text"
          value={outputFileName}
          onChange={(e) => handleFileNameChange(e.target.value)}
          placeholder={`output.${defaultExtension}`}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Directory
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={outputDirectory}
            readOnly
            placeholder="Will create 'output' folder in working directory if not set"
            className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50"
          />
          <button
            onClick={handleSelectDirectory}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Browse
          </button>
        </div>
      </div>
      
      <div className="pt-2">
        <button
          onClick={handleSelectOutputFile}
          disabled={!inputFile}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          Select Complete Output Path
        </button>
      </div>
      
      {outputFile && (
        <div className="text-sm text-gray-600">
          <strong>Full Output Path:</strong> {outputFile}
        </div>
      )}
    </div>
  );
}