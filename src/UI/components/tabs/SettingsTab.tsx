import { useState } from 'react';

interface SettingsTabProps {
  onSettingsChange?: (settings: any) => void;
}

export default function SettingsTab({ onSettingsChange }: SettingsTabProps) {
  const [hardwareAcceleration, setHardwareAcceleration] = useState(false);
  const [accelerationType, setAccelerationType] = useState('auto');
  const [threadCount, setThreadCount] = useState('auto');
  const [overwriteFiles, setOverwriteFiles] = useState(true);

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

  const glassClassName = "bg-slate-800/70 backdrop-blur-[10px] border border-slate-600/30 rounded-2xl shadow-2xl";
  const selectClassName = "bg-slate-900/50 border border-slate-600/40 rounded-xl py-3 px-4 pr-10 text-slate-200 text-sm transition-all duration-200 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer bg-[url('data:image/svg+xml,%3csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 20 20\\'%3e%3cpath stroke=\\'%236b7280\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1.5\\' d=\\'m6 8 4 4 4-4\\'/%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat";

  return (
    <div className="flex flex-col gap-6">
      {/* Hardware Acceleration Section */}
      <div className={glassClassName}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
            Hardware Acceleration
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Enable Hardware Acceleration
                </label>
                <p className="text-xs text-slate-400 mt-1 m-0">
                  Use GPU acceleration for faster processing (when available)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={hardwareAcceleration}
                  onChange={(e) => handleHardwareAccelChange(e.target.checked)}
                />
                <div
                  className={`w-11 h-6 rounded-xl relative transition-all duration-200 cursor-pointer border border-slate-600/30 ${
                    hardwareAcceleration 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                      : 'bg-slate-600/50'
                  }`}
                  onClick={() => handleHardwareAccelChange(!hardwareAcceleration)}
                >
                  <div
                    className={`w-[18px] h-[18px] bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-md ${
                      hardwareAcceleration ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </div>
              </label>
            </div>

            {hardwareAcceleration && (
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">
                  Acceleration Type
                </label>
                <select
                  value={accelerationType}
                  onChange={(e) => handleAccelerationTypeChange(e.target.value)}
                  className={selectClassName}
                >
                  <option value="auto">Auto Detect</option>
                  <option value="nvenc">NVIDIA NVENC</option>
                  <option value="qsv">Intel Quick Sync</option>
                  <option value="vaapi">VAAPI (Linux)</option>
                  <option value="videotoolbox">VideoToolbox (macOS)</option>
                </select>
                <p className="text-slate-500 text-xs mt-1 m-0">
                  Auto detect will try to find the best available hardware acceleration
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Settings Section */}
      <div className={glassClassName}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
            Performance Settings
          </h3>
          
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">
              Thread Count
            </label>
            <select 
              value={threadCount}
              onChange={(e) => setThreadCount(e.target.value)}
              className={selectClassName}
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="1">1 Thread</option>
              <option value="2">2 Threads</option>
              <option value="4">4 Threads</option>
              <option value="8">8 Threads</option>
            </select>
            <p className="text-slate-500 text-xs mt-1 m-0">
              Number of CPU threads to use for processing
            </p>
          </div>
        </div>
      </div>

      {/* Output Settings Section */}
      <div className={glassClassName}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-slate-200 mb-4 m-0">
            Output Settings
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-200">
                Overwrite Existing Files
              </label>
              <p className="text-xs text-slate-400 mt-1 m-0">
                Automatically overwrite files with the same name
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="hidden"
                checked={overwriteFiles}
                onChange={(e) => setOverwriteFiles(e.target.checked)}
              />
              <div
                className={`w-11 h-6 rounded-xl relative transition-all duration-200 cursor-pointer border border-slate-600/30 ${
                  overwriteFiles 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
                    : 'bg-slate-600/50'
                }`}
                onClick={() => setOverwriteFiles(!overwriteFiles)}
              >
                <div
                  className={`w-[18px] h-[18px] bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-md ${
                    overwriteFiles ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      <style>{`
        select option {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 8px 12px;
        }
        select option:hover {
          background-color: #334155;
        }
        select option:checked {
          background-color: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
}