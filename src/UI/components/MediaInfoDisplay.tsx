import { useState, useEffect } from 'react';

interface MediaInfo {
  duration?: number;
  format?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  size?: number;
  videoCodec?: string;
  audioCodec?: string;
  frameRate?: number;
  sampleRate?: number;
  channels?: number;
}

interface MediaInfoDisplayProps {
  inputFile: string | null;
  showThumbnail?: boolean;
  className?: string;
}

export default function MediaInfoDisplay({ inputFile, showThumbnail = false, className }: MediaInfoDisplayProps) {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inputFile) {
      setMediaInfo(null);
      setThumbnailPath(null);
      setError(null);
      return;
    }

    const loadMediaInfo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const info = await window.electronAPI.getMediaInfo(inputFile);
        setMediaInfo(info);

        if (showThumbnail && info.width && info.height) {
          try {
            const thumbPath = await window.electronAPI.generateThumbnail(inputFile);
            setThumbnailPath(thumbPath);
          } catch (thumbError) {
            console.warn('Failed to generate thumbnail:', thumbError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get media info');
      } finally {
        setLoading(false);
      }
    };

    loadMediaInfo();
  }, [inputFile, showThumbnail]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatBitrate = (bitrate?: number): string => {
    if (!bitrate) return 'Unknown';
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    }
    return `${Math.round(bitrate / 1000)} kbps`;
  };

  if (!inputFile) {
    return null;
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
            Media Information
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-slate-400 text-sm">Loading media info...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
            Media Information
          </h3>
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!mediaInfo) {
    return null;
  }

  return (
    <div className={className}>
      <div className="p-5">
        <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
          Media Information
        </h3>
        
        {showThumbnail && thumbnailPath && (
          <div className="mb-4">
            <img 
              src={`file://${thumbnailPath}`} 
              alt="Video thumbnail"
              className="w-full h-auto rounded-lg border border-slate-600/40 max-h-32 object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Duration:</span>
            <span className="text-slate-200 text-xs font-medium">{formatDuration(mediaInfo.duration)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Format:</span>
            <span className="text-slate-200 text-xs font-medium">{mediaInfo.format || 'Unknown'}</span>
          </div>

          {mediaInfo.width && mediaInfo.height && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Resolution:</span>
              <span className="text-slate-200 text-xs font-medium">{mediaInfo.width}x{mediaInfo.height}</span>
            </div>
          )}

          {mediaInfo.videoCodec && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Video Codec:</span>
              <span className="text-slate-200 text-xs font-medium">{mediaInfo.videoCodec.toUpperCase()}</span>
            </div>
          )}

          {mediaInfo.frameRate && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Frame Rate:</span>
              <span className="text-slate-200 text-xs font-medium">{mediaInfo.frameRate} fps</span>
            </div>
          )}

          {mediaInfo.audioCodec && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Audio Codec:</span>
              <span className="text-slate-200 text-xs font-medium">{mediaInfo.audioCodec.toUpperCase()}</span>
            </div>
          )}

          {mediaInfo.sampleRate && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Sample Rate:</span>
              <span className="text-slate-200 text-xs font-medium">{mediaInfo.sampleRate.toLocaleString()} Hz</span>
            </div>
          )}

          {mediaInfo.channels && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Channels:</span>
              <span className="text-slate-200 text-xs font-medium">
                {mediaInfo.channels} {mediaInfo.channels === 1 ? '(Mono)' : mediaInfo.channels === 2 ? '(Stereo)' : ''}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Bitrate:</span>
            <span className="text-slate-200 text-xs font-medium">{formatBitrate(mediaInfo.bitrate)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">File Size:</span>
            <span className="text-slate-200 text-xs font-medium">{formatFileSize(mediaInfo.size)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}