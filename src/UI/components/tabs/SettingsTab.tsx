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

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
  };

  const selectStyle = {
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(71, 85, 105, 0.4)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#e2e8f0',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px',
    cursor: 'pointer'
  };

  return (
    <>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Hardware Acceleration Section */}
        <div style={glassStyle}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
              Hardware Acceleration
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
                    Enable Hardware Acceleration
                  </label>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', margin: '4px 0 0 0' }}>
                    Use GPU acceleration for faster processing (when available)
                  </p>
                </div>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={hardwareAcceleration}
                    onChange={(e) => handleHardwareAccelChange(e.target.checked)}
                  />
                  <div
                    style={{
                      width: '44px',
                      height: '24px',
                      background: hardwareAcceleration 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                        : 'rgba(71, 85, 105, 0.5)',
                      borderRadius: '12px',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(71, 85, 105, 0.3)'
                    }}
                    onClick={() => handleHardwareAccelChange(!hardwareAcceleration)}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        background: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: hardwareAcceleration ? '22px' : '2px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }}
                    />
                  </div>
                </label>
              </div>

              {hardwareAcceleration && (
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                    Acceleration Type
                  </label>
                  <select
                    value={accelerationType}
                    onChange={(e) => handleAccelerationTypeChange(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="nvenc">NVIDIA NVENC</option>
                    <option value="qsv">Intel Quick Sync</option>
                    <option value="vaapi">VAAPI (Linux)</option>
                    <option value="videotoolbox">VideoToolbox (macOS)</option>
                  </select>
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
                    Auto detect will try to find the best available hardware acceleration
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Settings Section */}
        <div style={glassStyle}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
              Performance Settings
            </h3>
            
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
                Thread Count
              </label>
              <select 
                value={threadCount}
                onChange={(e) => setThreadCount(e.target.value)}
                style={selectStyle}
              >
                <option value="auto">Auto (Recommended)</option>
                <option value="1">1 Thread</option>
                <option value="2">2 Threads</option>
                <option value="4">4 Threads</option>
                <option value="8">8 Threads</option>
              </select>
              <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
                Number of CPU threads to use for processing
              </p>
            </div>
          </div>
        </div>

        {/* Output Settings Section */}
        <div style={glassStyle}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px', margin: 0 }}>
              Output Settings
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>
                  Overwrite Existing Files
                </label>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', margin: '4px 0 0 0' }}>
                  Automatically overwrite files with the same name
                </p>
              </div>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ display: 'none' }}
                  checked={overwriteFiles}
                  onChange={(e) => setOverwriteFiles(e.target.checked)}
                />
                <div
                  style={{
                    width: '44px',
                    height: '24px',
                    background: overwriteFiles 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                      : 'rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    border: '1px solid rgba(71, 85, 105, 0.3)'
                  }}
                  onClick={() => setOverwriteFiles(!overwriteFiles)}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      background: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: overwriteFiles ? '22px' : '2px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}