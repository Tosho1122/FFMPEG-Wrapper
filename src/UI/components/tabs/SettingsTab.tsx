import { useState } from 'react';

interface SettingsTabProps {
  onSettingsChange?: (settings: any) => void;
}

export default function SettingsTab({ onSettingsChange }: SettingsTabProps) {
  const [hardwareAcceleration, setHardwareAcceleration] = useState(false);
  const [accelerationType, setAccelerationType] = useState('auto');

  const handleHardwareAccelChange = (enabled: boolean) => {
    setHardwareAcceleration(enabled);
    if (onSettingsChange) {
      onSettingsChange({
        hardwareAcceleration: enabled,
        accelerationType: enabled ? accelerationType : 'none'
      });
    }
  };

  const handleAccelerationTypeChange = (type: string) => {
    setAccelerationType(type);
    if (onSettingsChange) {
      onSettingsChange({
        hardwareAcceleration,
        accelerationType: hardwareAcceleration ? type : 'none'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Hardware Acceleration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable Hardware Acceleration
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Use GPU acceleration for faster processing (when available)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={hardwareAcceleration}
                onChange={(e) => handleHardwareAccelChange(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {hardwareAcceleration && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acceleration Type
              </label>
              <select
                value={accelerationType}
                onChange={(e) => handleAccelerationTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="auto">Auto Detect</option>
                <option value="nvenc">NVIDIA NVENC</option>
                <option value="qsv">Intel Quick Sync</option>
                <option value="vaapi">VAAPI (Linux)</option>
                <option value="videotoolbox">VideoToolbox (macOS)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Auto detect will try to find the best available hardware acceleration
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thread Count
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="auto">Auto (Recommended)</option>
              <option value="1">1 Thread</option>
              <option value="2">2 Threads</option>
              <option value="4">4 Threads</option>
              <option value="8">8 Threads</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Number of CPU threads to use for processing
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Output Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Overwrite Existing Files
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically overwrite files with the same name
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked={true}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}