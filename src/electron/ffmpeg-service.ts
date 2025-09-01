import ffmpeg from 'fluent-ffmpeg';
import { EventEmitter } from 'events';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('@ffprobe-installer/ffprobe');

export interface ConversionProgress {
  percent?: number;
  currentFps?: number;
  currentKbps?: number;
  targetSize?: number;
  timemark?: string;
}

export interface MediaInfo {
  duration?: number;
  format?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  size?: number;
  streams?: any[];
}

export interface ConversionOptions {
  format?: string;
  quality?: string;
  width?: number;
  height?: number;
  bitrate?: string;
  fps?: number;
}

class FFmpegService extends EventEmitter {
  private ffmpegPath: string;

  constructor() {
    super();
    this.ffmpegPath = this.getFfmpegPath();
    ffmpeg.setFfmpegPath(this.ffmpegPath);
    
    // Try to set ffprobe path if available
    try {
      const ffprobePath = this.getFfprobePath();
      if (fs.existsSync(ffprobePath)) {
        ffmpeg.setFfprobePath(ffprobePath);
        console.log(`Using FFprobe at: ${ffprobePath}`);
      } else {
        console.log('FFprobe not found, using built-in ffprobe functionality');
      }
    } catch (error) {
      console.log('FFprobe setup failed, using built-in functionality:', error instanceof Error ? error.message : String(error));
    }
  }

  private getFfmpegPath(): string {
    // Check if we're in development or production
    if (app.isPackaged) {
      // In production, use the extracted FFmpeg from resources
      const resourcesPath = process.resourcesPath;
      const platform = process.platform;
      
      if (platform === 'win32') {
        return path.join(resourcesPath, 'ffmpeg.exe');
      } else if (platform === 'darwin' || platform === 'linux') {
        return path.join(resourcesPath, 'ffmpeg');
      }
    }
    
    // In development, use ffmpeg-static
    const ffmpegPath = ffmpegStatic;
    
    // Validate that the path exists
    if (!ffmpegPath) {
      throw new Error('FFmpeg static path not found. Please ensure ffmpeg-static is properly installed.');
    }
    
    if (!fs.existsSync(ffmpegPath)) {
      throw new Error(`FFmpeg executable not found at: ${ffmpegPath}`);
    }
    
    console.log(`Using FFmpeg at: ${ffmpegPath}`);
    return ffmpegPath;
  }

  private getFfprobePath(): string {
    // Check if we're in development or production
    if (app.isPackaged) {
      // In production, use the extracted ffprobe from resources
      const resourcesPath = process.resourcesPath;
      const platform = process.platform;
      
      if (platform === 'win32') {
        return path.join(resourcesPath, 'ffprobe.exe');
      } else if (platform === 'darwin' || platform === 'linux') {
        return path.join(resourcesPath, 'ffprobe');
      }
    }
    
    // In development, use ffprobe-static
    const ffprobePath = ffprobeStatic.path;
    
    if (!ffprobePath) {
      throw new Error('FFprobe static path not found. Please ensure @ffprobe-installer/ffprobe is properly installed.');
    }
    
    console.log(`Using FFprobe at: ${ffprobePath}`);
    return ffprobePath;
  }

  async getMediaInfo(inputPath: string): Promise<MediaInfo> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const format = metadata.format;
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');

        resolve({
          duration: format.duration,
          format: format.format_name,
          width: videoStream?.width,
          height: videoStream?.height,
          bitrate: format.bit_rate ? parseInt(format.bit_rate.toString()) : undefined,
          size: format.size ? parseInt(format.size.toString()) : undefined,
          streams: metadata.streams
        });
      });
    });
  }

  async convertVideo(
    inputPath: string, 
    outputPath: string, 
    options: ConversionOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      if (options.format) {
        command = command.format(options.format);
      }

      if (options.quality) {
        command = command.videoCodec('libx264').audioCodec('aac').videoBitrate(options.quality);
      }

      if (options.width && options.height) {
        command = command.size(`${options.width}x${options.height}`);
      }

      if (options.bitrate) {
        command = command.videoBitrate(options.bitrate);
      }

      if (options.fps) {
        command = command.fps(options.fps);
      }

      command
        .on('progress', (progress) => {
          const progressData: ConversionProgress = {
            percent: progress.percent,
            currentFps: progress.currentFps,
            currentKbps: progress.currentKbps,
            targetSize: progress.targetSize,
            timemark: progress.timemark
          };
          this.emit('progress', progressData);
        })
        .on('end', () => {
          this.emit('complete', outputPath);
          resolve();
        })
        .on('error', (err) => {
          this.emit('error', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async extractAudio(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .on('progress', (progress) => {
          this.emit('progress', { percent: progress.percent });
        })
        .on('end', () => {
          this.emit('complete', outputPath);
          resolve();
        })
        .on('error', (err) => {
          this.emit('error', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async compressVideo(
    inputPath: string, 
    outputPath: string, 
    quality: string = '28'
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get media info first for better progress tracking
        const mediaInfo = await this.getMediaInfo(inputPath);
        const duration = mediaInfo.duration;
        
        console.log(`Starting compression with quality ${quality}, duration: ${duration}s`);
        
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .addOption('-crf', quality)
          .addOption('-preset', 'medium') // Add preset for better encoding
          .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('Progress event:', progress);
            
            // Calculate percentage manually if needed
            let percent = progress.percent;
            if (!percent && duration && progress.timemark) {
              const timemarkSeconds = this.timemarkToSeconds(progress.timemark);
              percent = Math.min((timemarkSeconds / duration) * 100, 100);
            }
            
            const progressData: ConversionProgress = {
              percent: percent || 0,
              currentFps: progress.currentFps,
              currentKbps: progress.currentKbps,
              targetSize: progress.targetSize,
              timemark: progress.timemark
            };
            
            this.emit('progress', progressData);
          })
          .on('end', () => {
            console.log('Compression completed successfully');
            this.emit('complete', outputPath);
            resolve();
          })
          .on('error', (err) => {
            console.error('Compression error:', err);
            this.emit('error', err);
            reject(err);
          })
          .save(outputPath);
      } catch (error) {
        console.error('Error getting media info:', error);
        reject(error);
      }
    });
  }

  private timemarkToSeconds(timemark: string): number {
    const parts = timemark.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseFloat(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }

}

export default FFmpegService;