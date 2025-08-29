import { useEffect, useState } from 'react';

interface PacManLoaderProps {
  progress: number;
  isVisible: boolean;
}

export default function PacManLoader({ progress, isVisible }: PacManLoaderProps) {
  const [pacmanPosition, setPacmanPosition] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(true);

  useEffect(() => {
    setPacmanPosition(progress);
  }, [progress]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 200);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const dots = Array.from({ length: 20 }, (_, i) => i);
  const eatenDots = Math.floor((progress / 100) * dots.length);

  return (
    <div className="w-full bg-gray-100 rounded-lg p-4 my-4">
      <div className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden">
        <div className="flex items-center h-full px-2">
          {dots.map((dot, index) => (
            <div
              key={dot}
              className={`w-2 h-2 rounded-full mx-1 transition-opacity duration-200 ${
                index < eatenDots ? 'opacity-0' : 'bg-yellow-400'
              }`}
            />
          ))}
        </div>
        
        <div
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-out"
          style={{ 
            left: `${Math.min(pacmanPosition * 0.85, 85)}%`,
            transform: `translate(-50%, -50%)` 
          }}
        >
          <div className="relative">
            <div 
              className={`w-8 h-8 bg-yellow-400 rounded-full relative transition-all duration-200 ${
                mouthOpen ? 'clip-path-pacman-open' : ''
              }`}
              style={{
                clipPath: mouthOpen 
                  ? 'polygon(100% 74%, 44% 48%, 100% 21%, 100% 0%, 0% 0%, 0% 100%, 100% 100%)'
                  : 'none'
              }}
            >
              <div className="absolute top-2 left-2 w-1 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <div className="text-lg font-bold text-gray-700">
          {progress.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500">
          Pac-Man is eating your file... 🎮
        </div>
      </div>
    </div>
  );
}