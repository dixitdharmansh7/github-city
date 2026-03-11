import { useMemo } from 'react';
import { getLanguageColor } from '../utils/languageColors';

const Tooltip = ({ data, position }) => {
  const style = useMemo(() => {
    if (!position) return { display: 'none' };
    
    const x = Math.min(position.x + 15, window.innerWidth - 320);
    const y = Math.min(position.y + 15, window.innerHeight - 280);
    
    return { left: x, top: y };
  }, [position]);
  
  if (!data) return null;
  
  // Safely get values with fallbacks
  const username = data.username || 'Unknown';
  const language = data.primary_language || 'Unknown';
  const commits = data.commits || 0;
  const stars = data.stars || 0;
  const followers = data.followers || 0;
  const repositories = data.repositories || 0;
  const height = data.height || 0;
  const baseSize = data.baseSize || 0;
  const floors = data.floors || 1;
  const district = data.district || 'unknown';
  const architectureType = data.architecture?.type || 'building';
  const rank = data.rank || 0;
  
  const languageColor = getLanguageColor(language);
  
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  
  const formatDistrict = (d) => {
    if (!d) return 'Unknown';
    return d.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  
  const formatBuildingType = (type) => {
    if (!type) return 'Building';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const getRankBadge = (r) => {
    const percentile = (r / 200) * 100;
    if (percentile < 5) return { text: 'Elite', color: 'from-yellow-400 to-orange-500' };
    if (percentile < 15) return { text: 'Pro', color: 'from-purple-400 to-pink-500' };
    if (percentile < 35) return { text: 'Active', color: 'from-blue-400 to-cyan-500' };
    return { text: 'Developer', color: 'from-gray-400 to-gray-500' };
  };
  
  const rankBadge = getRankBadge(rank);
  
  return (
    <div 
      className="fixed z-[100] glass rounded-xl p-4 shadow-2xl pointer-events-none min-w-[300px] max-w-[350px]"
      style={style}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${languageColor}, ${languageColor}80)` 
            }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{username}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: languageColor }}
              />
              <span className="text-gray-400 text-sm">{language}</span>
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rankBadge.color}`}>
          {rankBadge.text}
        </span>
      </div>
      
      {/* District & Architecture */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
          <div className="text-gray-500 text-xs uppercase tracking-wider">District</div>
          <div className="text-gray-300 text-sm font-medium">{formatDistrict(district)}</div>
        </div>
        <div className="flex-1 bg-white/5 rounded-lg px-3 py-2">
          <div className="text-gray-500 text-xs uppercase tracking-wider">Architecture</div>
          <div className="text-gray-300 text-sm font-medium">{formatBuildingType(architectureType)}</div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Commits
          </div>
          <div className="text-green-400 font-bold text-xl">{formatNumber(commits)}</div>
          <div className="text-gray-600 text-xs">Building height</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Repos
          </div>
          <div className="text-blue-400 font-bold text-xl">{formatNumber(repositories)}</div>
          <div className="text-gray-600 text-xs">{floors} floors</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Stars
          </div>
          <div className="text-yellow-400 font-bold text-xl">{formatNumber(stars)}</div>
          <div className="text-gray-600 text-xs">Glow intensity</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Followers
          </div>
          <div className="text-purple-400 font-bold text-xl">{formatNumber(followers)}</div>
          <div className="text-gray-600 text-xs">Base footprint</div>
        </div>
      </div>
      
      {/* Building Specs */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Building Specs</span>
          <span className="text-gray-400 font-mono">
            {height.toFixed(1)}m × {baseSize.toFixed(1)}m
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(100, (height / 180) * 100)}%`,
              background: `linear-gradient(90deg, ${languageColor}, ${languageColor}80)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
