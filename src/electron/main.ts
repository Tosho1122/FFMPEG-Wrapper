import {app, BrowserWindow, ipcMain, dialog} from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import FFmpegService, { type ConversionOptions } from './ffmpeg-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ffmpegService = new FFmpegService();

ffmpegService.on('progress', (progress) => {
    BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('ffmpeg-progress', progress);
    });
});

ffmpegService.on('complete', (outputPath) => {
    BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('ffmpeg-complete', outputPath);
    });
});

ffmpegService.on('error', (error) => {
    BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('ffmpeg-error', error.message);
    });
});

ipcMain.handle('select-input-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'] },
            { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-output-file', async (_, defaultName: string) => {
    const result = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [
            { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm'] },
            { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'aac'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.canceled ? null : result.filePath;
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-media-info', async (_, inputPath: string) => {
    try {
        return await ffmpegService.getMediaInfo(inputPath);
    } catch (error) {
        throw error;
    }
});

ipcMain.handle('convert-video', async (_, inputPath: string, outputPath: string, options: ConversionOptions) => {
    try {
        await ffmpegService.convertVideo(inputPath, outputPath, options);
        return true;
    } catch (error) {
        throw error;
    }
});

ipcMain.handle('extract-audio', async (_, inputPath: string, outputPath: string) => {
    try {
        await ffmpegService.extractAudio(inputPath, outputPath);
        return true;
    } catch (error) {
        throw error;
    }
});

ipcMain.handle('compress-video', async (_, inputPath: string, outputPath: string, quality: string) => {
    try {
        await ffmpegService.compressVideo(inputPath, outputPath, quality);
        return true;
    } catch (error) {
        throw error;
    }
});


app.on('ready', ()=>{
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadFile(path.join(app.getAppPath(),'/dist-react/index.html'));
});

