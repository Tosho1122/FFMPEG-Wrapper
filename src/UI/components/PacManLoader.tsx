import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PacManLoaderProps {
  progress: number;
  isVisible: boolean;
}

export default function PacManLoader({ progress, isVisible }: PacManLoaderProps) {
  const [mouthOpen, setMouthOpen] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 150);

    return () => clearInterval(interval);
  }, [isVisible]);

  const dots = Array.from({ length: 25 }, (_, i) => i);
  const isComplete = progress >= 100;
  
  // Calculate PacMan's position to align with dots
  // At 0% progress: PacMan at first dot (index 0)
  // At 100% progress: PacMan at last dot (index dots.length - 1)
  const pacmanDotPosition = Math.min((progress / 100) * (dots.length - 1), dots.length - 1);
  const pacmanLeftPercent = (pacmanDotPosition / (dots.length - 1)) * 100;
  
  // Dots should disappear when PacMan reaches or passes them
  // Use Math.ceil to make dots disappear as PacMan reaches them (not after)
  const eatenDots = Math.ceil(pacmanDotPosition);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="relative w-full h-16 bg-slate-700/80 rounded-2xl overflow-hidden border border-slate-600/20">
            
            {/* Progress track with dots */}
            <div className="absolute inset-0 flex items-center px-4 justify-between">
              {dots.map((dot, index) => {
                const isLast = index === dots.length - 1;
                const isEaten = index < eatenDots;
                
                return (
                  <motion.div
                    key={dot}
                    className={`${
                      isLast 
                        ? 'w-4 h-4' // Bigger end dot
                        : 'w-2.5 h-2.5'
                    } rounded-full ${
                      isLast 
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-400/50' 
                        : 'bg-blue-400 shadow-sm shadow-blue-400/30'
                    }`}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ 
                      scale: isEaten ? 0 : 1, 
                      opacity: isEaten ? 0 : 1,
                      rotate: isLast ? [0, 360] : 0
                    }}
                    transition={{ 
                      duration: isEaten ? 0.3 : 0.5,
                      type: "spring",
                      stiffness: isLast ? 200 : 400,
                      damping: 20,
                      repeat: isLast && !isEaten ? Infinity : 0,
                      repeatDelay: 0.5
                    }}
                  />
                );
              })}
            </div>
            
            {/* PacMan positioned in same coordinate system as dots */}
            <div className="absolute inset-0 flex items-center px-4 justify-between pointer-events-none">
              <motion.div
                className="absolute"
                style={{ 
                  left: `${pacmanLeftPercent}%`,
                  transform: `translateX(-50%)` 
                }}
                animate={{ 
                  rotate: mouthOpen ? 0 : 2
                }}
                transition={{ duration: 0.15 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full relative"
                  style={{
                    clipPath: mouthOpen 
                      ? 'polygon(100% 74%, 44% 48%, 100% 21%, 100% 0%, 0% 0%, 0% 100%, 100% 100%)'
                      : 'circle(50% at 50% 50%)'
                  }}
                  animate={{ 
                    scale: mouthOpen ? 1 : 1.05
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {/* PacMan eye */}
                  <motion.div 
                    className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-black rounded-full"
                    animate={{ scale: mouthOpen ? 1 : 0.8 }}
                    transition={{ duration: 0.15 }}
                  />
                </motion.div>
                
                {/* Trail effect */}
                <motion.div 
                  className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-1.5 bg-gradient-to-r from-yellow-400/30 to-transparent rounded-full blur-sm"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Completion sparkle effect */}
            <AnimatePresence>
              {isComplete && (
                <motion.div 
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        right: `${10 + Math.random() * 80}%`,
                      }}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ 
                        scale: [0, 1, 0], 
                        rotate: 360,
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Progress text */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-slate-300">
              <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {progress.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400 flex items-center gap-2">
                <motion.span 
                  animate={{ 
                    scale: mouthOpen ? 1.1 : 1
                  }}
                  transition={{ duration: 0.15 }}
                >
                  🟡
                </motion.span>
                Pac-Man is eating your file...
              </div>
            </div>
            
            <AnimatePresence>
              {isComplete && (
                <motion.div 
                  className="text-emerald-400 font-medium text-sm"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  ✨ Complete!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}