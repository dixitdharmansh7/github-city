import { useState, useEffect, useRef } from 'react';
import { getGitHubUserData, isValidGitHubUsername } from '../utils/githubApi';

const WelcomeModal = ({ isOpen, onClose, onUserCreated }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent pointer lock when modal is open
  useEffect(() => {
    if (isOpen) {
      // Exit pointer lock if active
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      
      // Prevent any pointer lock requests
      const preventPointerLock = (e) => {
        e.stopPropagation();
      };
      
      document.addEventListener('pointerlockchange', preventPointerLock, true);
      document.addEventListener('pointerlockerror', preventPointerLock, true);
      
      return () => {
        document.removeEventListener('pointerlockchange', preventPointerLock, true);
        document.removeEventListener('pointerlockerror', preventPointerLock, true);
      };
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    if (!isValidGitHubUsername(username)) {
      setError('Invalid GitHub username format');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getGitHubUserData(username.trim());
      setUserData(data);
      
      // Mark as visited
      localStorage.setItem('github-city-visited', 'true');
      localStorage.setItem('github-city-user', JSON.stringify(data));
      
      // Notify parent
      onUserCreated(data);
      
      // Close after showing success briefly
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch GitHub data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('github-city-visited', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching canvas
    >
      <div 
        className="glass rounded-2xl p-8 max-w-md w-full mx-4 relative"
        style={{ pointerEvents: 'auto' }} // Ensure this captures all mouse events
      >
        {!userData ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to GitHub City!</h2>
              <p className="text-gray-400">
                Enter your GitHub username to create your own building in the city.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  GitHub Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="torvalds"
                    className="w-full bg-black/40 text-white border border-white/20 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all"
                    disabled={isLoading}
                    autoFocus
                    onKeyDown={(e) => e.stopPropagation()} // Prevent key events from bubbling
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fetching Data...
                  </>
                ) : (
                  <>
                    Create My Building
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-3 bg-white/5 text-gray-400 rounded-xl font-medium hover:bg-white/10 transition-all"
              >
                Skip for now
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Your data will be stored locally. We don't save anything to our servers.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Building Created!</h2>
            <p className="text-gray-400 mb-4">
              Welcome, <span className="text-white font-medium">{userData.username}</span>!
            </p>
            <div className="bg-white/5 rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Repositories:</span>
                <span className="text-white font-medium">{userData.repositories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Commits:</span>
                <span className="text-white font-medium">{userData.commits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Stars:</span>
                <span className="text-yellow-400 font-medium">{userData.stars.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Followers:</span>
                <span className="text-purple-400 font-medium">{userData.followers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Primary Language:</span>
                <span className="text-blue-400 font-medium">{userData.primary_language}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Find your building in the city!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeModal;
