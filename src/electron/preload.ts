import { contextBridge, ipcRenderer } from 'electron';
import { type ConversionOptions } from './ffmpeg-service';

export interface ElectronAPI {
  selectInputFile: () => Promise<string | null>;
  selectOutputFile: (defaultName: string) => Promise<string | null>;
  selectDirectory: () => Promise<string | null>;
  getMediaInfo: (inputPath: string) => Promise<any>;
  convertVideo: (inputPath: string, outputPath: string, options: ConversionOptions) => Promise<boolean>;
  extractAudio: (inputPath: string, outputPath: string) => Promise<boolean>;
  compressVideo: (inputPath: string, outputPath: string, quality: string) => Promise<boolean>;
  revealFile: (filePath: string) => Promise<void>;
  onProgress: (callback: (progress: any) => void) => void;
  onComplete: (callback: (outputPath: string) => void) => void;
  onError: (callback: (error: string) => void) => void;
  onFileDropped: (callback: (filePath: string) => void) => void;
  removeAllListeners: (channel: string) => void;
}

const electronAPI: ElectronAPI = {
  selectInputFile: () => ipcRenderer.invoke('select-input-file'),
  selectOutputFile: (defaultName: string) => ipcRenderer.invoke('select-output-file', defaultName),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getMediaInfo: (inputPath: string) => ipcRenderer.invoke('get-media-info', inputPath),
  convertVideo: (inputPath: string, outputPath: string, options: ConversionOptions) => 
    ipcRenderer.invoke('convert-video', inputPath, outputPath, options),
  extractAudio: (inputPath: string, outputPath: string) => 
    ipcRenderer.invoke('extract-audio', inputPath, outputPath),
  compressVideo: (inputPath: string, outputPath: string, quality: string) => 
    ipcRenderer.invoke('compress-video', inputPath, outputPath, quality),
  revealFile: (filePath: string) => ipcRenderer.invoke('reveal-file', filePath),
  onProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('ffmpeg-progress', (_, progress) => callback(progress));
  },
  onComplete: (callback: (outputPath: string) => void) => {
    ipcRenderer.on('ffmpeg-complete', (_, outputPath) => callback(outputPath));
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('ffmpeg-error', (_, error) => callback(error));
  },
  onFileDropped: (callback: (filePath: string) => void) => {
    ipcRenderer.on('file-dropped', (_, filePath) => callback(filePath));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);