import ffmpeg from 'fluent-ffmpeg';
import { EventEmitter } from 'events';
import { app } from 'electron';
import * as path from 'path';

const ffmpegStatic = require('ffmpeg-static');

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
    return ffmpegStatic || 'ffmpeg';
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
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .addOption('-crf', quality)
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

}

export default FFmpegService;