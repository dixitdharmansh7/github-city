import { useState, useEffect, useCallback, useRef } from 'react';
import City from './components/City';
import Tooltip from './components/Tooltip';
import ControlPanel from './components/ControlPanel';
import FlyingCameraUI from './components/FlyingCameraUI';
import WelcomeModal from './components/WelcomeModal';
import { loadCSVData, processCityData, filterData } from './utils/dataLoader';

function App() {
  // State
  const [rawData, setRawData] = useState([]);
  const [cityData, setCityData] = useState({ buildings: [], roads: [], parks: [] });
  const [dataLastUpdated, setDataLastUpdated] = useState(null);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [targetUser, setTargetUser] = useState(null); // For navigation
  
  // Camera state
  const [cameraMode, setCameraMode] = useState('fly');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  
  // Store canvas element
  const canvasElementRef = useRef(null);
  const cityRef = useRef(null);
  
  // Tooltip state
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // UI state
  const [controlsVisible, setControlsVisible] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    language: 'all',
    sortBy: 'commits',
    sortOrder: 'desc',
    highlightTop: false
  });
  
  // Load CSV data and check for existing user
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadCSVData('/github_data.csv');
        
        // Check for existing user in localStorage
        const savedUser = localStorage.getItem('github-city-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
          data.push(userData);
        } else {
          setShowWelcome(true);
        }
        
        // Store the last updated timestamp
        setDataLastUpdated(data.lastUpdated || new Date().toISOString().split('T')[0]);
        setRawData(data);
        setLoading(false);
      } catch (err) {
        console.error('[App] Failed to load data:', err);
        setError('Failed to load GitHub data. Please check the console.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Process city data
  useEffect(() => {
    if (rawData.length === 0) return;
    
    const processed = processCityData(rawData, filters.sortBy, filters.sortOrder);
    setCityData(processed);
  }, [rawData, filters.sortBy, filters.sortOrder]);
  
  // Apply filters
  useEffect(() => {
    const filtered = filterData(cityData.buildings, filters);
    setFilteredBuildings(filtered);
  }, [cityData.buildings, filters]);
  
  // Handle new user creation
  const handleUserCreated = useCallback((userData) => {
    setCurrentUser(userData);
    setRawData(prev => [...prev, userData]);
  }, []);
  
  // Handle pointer lock change
  const handlePointerLockChange = useCallback((locked) => {
    setIsPointerLocked(locked);
  }, []);
  
  // Handle building hover - with debug
  const handleBuildingHover = useCallback((building, event) => {
    if (building) {
      console.log('[App] Hovering over:', building.username);
      setHoveredBuilding(building);
      if (event && event.clientX !== undefined) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    } else {
      setHoveredBuilding(null);
    }
  }, []);
  
  // Handle mouse move for tooltip
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (hoveredBuilding) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredBuilding]);
  
  // Handle building click
  const handleBuildingClick = useCallback((building) => {
    console.log('[App] Clicked building:', building);
  }, []);
  
  // Handle canvas ready
  const handleCanvasReady = useCallback((canvas) => {
    canvasElementRef.current = canvas;
  }, []);

  // Reset welcome
  const handleResetWelcome = () => {
    localStorage.removeItem('github-city-visited');
    localStorage.removeItem('github-city-user');
    window.location.reload();
  };
  
  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = filteredBuildings
      .filter(b => b.username?.toLowerCase().includes(lowerQuery))
      .slice(0, 10);
    
    setSearchResults(results);
    setShowSearchResults(true);
  };
  
  // Navigate to a user's building
  const navigateToUser = (username) => {
    const building = filteredBuildings.find(
      b => b.username?.toLowerCase() === username.toLowerCase()
    );
    
    if (!building) {
      alert(`User "${username}" not found in the city.`);
      return;
    }
    
    // Set target user for highlighting
    setTargetUser(username);
    
    // Clear target after 5 seconds
    setTimeout(() => {
      setTargetUser(null);
    }, 5000);
    
    // Switch to orbit mode for better viewing
    setCameraMode('orbit');
    
    // Navigate to building position
    const [x, y, z] = building.position;
    const totalHeight = building.architecture?.segments?.reduce((sum, seg) => sum + (seg.height || 0), 0) || 20;
    
    // Use the city ref to access camera navigation (we'll implement this)
    if (cityRef.current) {
      // This will be handled by the City component
      console.log(`[App] Navigating to ${username} at [${x}, ${y}, ${z}]`);
    }
    
    // Hide search results
    setShowSearchResults(false);
    setSearchQuery('');
    
    // Scroll to building info
    setHoveredBuilding(building);
    setTimeout(() => setHoveredBuilding(null), 3000);
  };
  
  // Find and navigate to current user's building
  const goToMyBuilding = () => {
    if (!currentUser) {
      setShowWelcome(true);
      return;
    }
    navigateToUser(currentUser.username);
  };
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
    };
    
    if (showSearchResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSearchResults]);
  
  // Loading screen
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050508]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        </div>
        <p className="text-gray-400 text-lg mt-6 animate-pulse">Constructing GitHub City...</p>
        <p className="text-gray-600 text-sm mt-2">Planning districts • Zoning areas • Raising skyscrapers</p>
      </div>
    );
  }
  
  // Error screen
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050508]">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-400 text-lg mb-2">Construction Failed</p>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full relative">
      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal
          isOpen={showWelcome}
          onClose={() => setShowWelcome(false)}
          onUserCreated={handleUserCreated}
        />
      )}
      
      {/* Debug info - always visible */}
      <div className="fixed top-20 left-4 z-[200] text-xs text-gray-500 bg-black/70 p-2 rounded pointer-events-none">
        <div>Buildings: {filteredBuildings.length}</div>
        <div>Hover: {hoveredBuilding ? hoveredBuilding.username : 'none'}</div>
        <div>Mode: {cameraMode}</div>
        <div>Locked: {isPointerLocked ? 'yes' : 'no'}</div>
      </div>

      {/* Header */}
      {!isPointerLocked && (
        <>
          <div className="fixed top-4 left-4 z-40 pointer-events-none">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                GitHub
              </span>
              <span className="text-white"> City</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-gray-400 text-sm">
                {filteredBuildings.length} buildings
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-sm">
                {cityData.stats?.districts || 0} districts
              </span>
              {dataLastUpdated && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500 text-xs" title="Data last updated">
                    Updated: {new Date(dataLastUpdated).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </>
              )}
              {currentUser && (
                <>
                  <span className="text-gray-600">•</span>
                  <button 
                    onClick={goToMyBuilding}
                    className="text-green-400 text-sm hover:text-green-300 transition-colors pointer-events-auto"
                  >
                    Welcome, {currentUser.username}! 👆
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="fixed top-4 right-4 z-50">
            <div className="relative">
              <div className="glass rounded-full flex items-center overflow-hidden">
                <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Find a user..."
                  className="bg-transparent text-white px-3 py-2 w-48 focus:outline-none text-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="px-3 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-64 glass rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  {searchResults.map((building) => (
                    <button
                      key={building.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToUser(building.username);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: building.color + '40', color: building.color }}
                      >
                        {building.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{building.username}</div>
                        <div className="text-gray-400 text-xs">{building.district}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        #{building.rank || '-'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {showSearchResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full right-0 mt-2 w-64 glass rounded-xl px-4 py-3">
                  <p className="text-gray-400 text-sm">No users found</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Camera Mode Toggle */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
            <div className="glass rounded-full p-1 flex items-center gap-1">
              <button
                onClick={() => setCameraMode('fly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  cameraMode === 'fly' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Fly Mode
              </button>
              <button
                onClick={() => setCameraMode('orbit')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  cameraMode === 'orbit' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Orbit
              </button>
            </div>
          </div>
          
          <button
            onClick={handleResetWelcome}
            className="fixed top-20 right-4 z-40 px-3 py-2 text-xs bg-white/10 hover:bg-white/20 text-gray-400 rounded-lg transition-all"
          >
            Reset Welcome
          </button>
        </>
      )}
      
      {/* 3D City */}
      <City 
        ref={cityRef}
        onCanvasReady={handleCanvasReady}
        buildings={filteredBuildings}
        roads={cityData.roads}
        parks={cityData.parks}
        onBuildingHover={handleBuildingHover}
        onBuildingClick={handleBuildingClick}
        cameraMode={cameraMode}
        onPointerLockChange={handlePointerLockChange}
        isPaused={showWelcome}
        currentUser={currentUser}
        targetUser={targetUser}
      />
      
      {/* Flying Camera UI */}
      {!showWelcome && (
        <FlyingCameraUI 
          cameraMode={cameraMode}
          canvas={canvasElementRef.current}
        />
      )}
      
      {/* Tooltip - always render when there's data, higher z-index */}
      {hoveredBuilding && !isPointerLocked && (
        <Tooltip 
          data={hoveredBuilding}
          position={mousePosition}
        />
      )}
      
      {/* Control Panel */}
      {!isPointerLocked && !showWelcome && (
        <ControlPanel
          filters={filters}
          onFilterChange={setFilters}
          data={rawData}
          isVisible={controlsVisible}
          onToggle={() => setControlsVisible(!controlsVisible)}
        />
      )}
      
      {/* Instructions */}
      {!isPointerLocked && !showWelcome && (
        <div className="fixed bottom-4 left-4 z-40 glass rounded-lg px-4 py-3 text-xs text-gray-400">
          {cameraMode === 'fly' ? (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white">WASD</kbd>
                <span>Fly</span>
              </span>
              <span className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white">Mouse</kbd>
                <span>Look</span>
              </span>
              <span className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white">Q/E</kbd>
                <span>Up/Down</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white">Drag</kbd>
                <span>Rotate</span>
              </span>
              <span className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-white">Scroll</kbd>
                <span>Zoom</span>
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Mode indicator */}
      <div className={`fixed ${isPointerLocked ? 'bottom-4 left-4' : 'bottom-4 right-4'} z-40 text-right pointer-events-none`}>
        <div className={`glass rounded-lg px-4 py-2 ${isPointerLocked ? 'bg-green-500/20' : ''}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Current Mode</div>
          <div className="text-white font-medium flex items-center gap-2">
            {cameraMode === 'fly' ? (
              <>
                <span className={`w-2 h-2 rounded-full ${isPointerLocked ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                {isPointerLocked ? 'Flying (Mouse Locked)' : 'Flying (Paused)'}
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Orbit View
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
