import { useState, useEffect } from 'react';

const FlyingCameraUI = ({ cameraMode, canvas }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  useEffect(() => {
    if (cameraMode !== 'fly') {
      setIsLocked(false);
      setShowInstructions(false);
      return;
    }
    
    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      setIsLocked(locked);
      setShowInstructions(!locked && cameraMode === 'fly');
    };
    
    document.addEventListener('pointerlockchange', onPointerLockChange);
    
    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    };
  }, [cameraMode, canvas]);
  
  const handleStartFlying = () => {
    canvas?.requestPointerLock?.();
  };
  
  // Don't show anything if not in fly mode
  if (cameraMode !== 'fly') return null;
  
  return (
    <>
      {/* Instructions overlay - shown when not locked */}
      {showInstructions && !isLocked && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleStartFlying}
        >
          <div className="glass rounded-2xl p-8 max-w-md text-center cursor-pointer hover:scale-105 transition-transform">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Flight Mode Paused</h2>
            <p className="text-gray-400 mb-6">Click anywhere to resume flying</p>
            
            <div className="grid grid-cols-2 gap-4 text-left text-sm mb-6">
              <div className="flex items-center gap-3">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-mono">WASD</kbd>
                <span className="text-gray-400">Fly</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-mono">Mouse</kbd>
                <span className="text-gray-400">Look</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-mono">Q / Space</kbd>
                <span className="text-gray-400">Fly Up</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-mono">E / Shift</kbd>
                <span className="text-gray-400">Fly Down</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-mono">Tab</kbd>
                <span className="text-gray-400">Pause/Resume</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white font-mono">ESC</kbd>
                <span className="text-gray-400">Release Mouse</span>
              </div>
            </div>
            
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleStartFlying();
              }}
            >
              Resume Flying
            </button>
          </div>
        </div>
      )}
      
      {/* Status bar - always visible in fly mode */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className={`glass rounded-full px-6 py-3 flex items-center gap-4 ${isLocked ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            <span className="text-white/80 text-sm">
              {isLocked ? 'Flying - Mouse Locked' : 'Paused - Mouse Free'}
            </span>
          </div>
          
          {!isLocked && (
            <>
              <div className="text-gray-500">|</div>
              <button
                onClick={handleStartFlying}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Click to Fly
              </button>
            </>
          )}
          
          {isLocked && (
            <>
              <div className="text-gray-500">|</div>
              <span className="text-gray-400 text-sm">
                Press <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white text-xs mx-1">ESC</kbd> or <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white text-xs mx-1">Tab</kbd> to use mouse
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FlyingCameraUI;
