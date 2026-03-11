import { useMemo } from 'react';
import { getUniqueLanguages } from '../utils/languageColors';

const ControlPanel = ({ 
  filters, 
  onFilterChange, 
  data, 
  isVisible, 
  onToggle 
}) => {
  const languages = useMemo(() => getUniqueLanguages(data), [data]);
  
  const handleLanguageChange = (e) => {
    onFilterChange({ ...filters, language: e.target.value });
  };
  
  const handleSortChange = (e) => {
    onFilterChange({ ...filters, sortBy: e.target.value });
  };
  
  const handleSortOrderChange = (e) => {
    onFilterChange({ ...filters, sortOrder: e.target.value });
  };
  
  const handleHighlightToggle = () => {
    onFilterChange({ ...filters, highlightTop: !filters.highlightTop });
  };
  
  // District info
  const districts = useMemo(() => [
    { name: 'Downtown', desc: 'Top 5% - Elite developers', color: 'bg-yellow-500/20' },
    { name: 'Midtown', desc: 'Top 15% - Pros', color: 'bg-purple-500/20' },
    { name: 'Tech Hub', desc: 'JS/TS concentration', color: 'bg-blue-500/20' },
    { name: 'Industrial', desc: 'C/C++/Rust/Go', color: 'bg-gray-500/20' },
    { name: 'University', desc: 'Python/Academic', color: 'bg-purple-500/20' },
    { name: 'Uptown', desc: 'Active contributors', color: 'bg-green-500/20' },
    { name: 'Suburbs', desc: 'Steady developers', color: 'bg-teal-500/20' },
    { name: 'Startup', desc: 'Growing projects', color: 'bg-orange-500/20' },
  ], []);
  
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 glass p-3 rounded-xl text-white hover:bg-white/10 transition-all hover:scale-105"
        title={isVisible ? "Hide Controls" : "Show Controls"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isVisible ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          )}
        </svg>
      </button>
      
      {/* Control Panel */}
      {isVisible && (
        <div className="fixed top-4 right-16 z-50 glass rounded-2xl p-6 w-96 max-h-[90vh] overflow-y-auto">
          <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="leading-tight">City Controls</div>
              <div className="text-xs text-gray-400 font-normal">Urban planning dashboard</div>
            </div>
          </h2>
          
          {/* Filter Section */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Language
            </h3>
            <select
              value={filters.language}
              onChange={handleLanguageChange}
              className="w-full bg-black/40 text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all hover:bg-black/50"
            >
              <option value="all" className="bg-gray-900">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang} className="bg-gray-900">{lang}</option>
              ))}
            </select>
          </div>
          
          {/* Sort Section */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort Buildings
            </h3>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="flex-1 bg-black/40 text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all hover:bg-black/50"
              >
                <option value="commits" className="bg-gray-900">Commits</option>
                <option value="stars" className="bg-gray-900">Stars</option>
                <option value="followers" className="bg-gray-900">Followers</option>
                <option value="repositories" className="bg-gray-900">Repositories</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={handleSortOrderChange}
                className="w-20 bg-black/40 text-white border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:border-blue-500/50 transition-all hover:bg-black/50 text-center"
              >
                <option value="desc" className="bg-gray-900">↓</option>
                <option value="asc" className="bg-gray-900">↑</option>
              </select>
            </div>
          </div>
          
          {/* Highlight Section */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Highlights
            </h3>
            <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <div className={`relative w-14 h-7 rounded-full transition-all ${filters.highlightTop ? 'bg-yellow-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${filters.highlightTop ? 'translate-x-8' : 'translate-x-1'}`} />
              </div>
              <input
                type="checkbox"
                checked={filters.highlightTop}
                onChange={handleHighlightToggle}
                className="hidden"
              />
              <div>
                <span className={`text-sm font-medium block ${filters.highlightTop ? 'text-yellow-400' : 'text-gray-400'}`}>
                  Highlight Top 10%
                </span>
                <span className="text-xs text-gray-500">Show elite developers</span>
              </div>
            </label>
          </div>
          
          {/* Districts Guide */}
          <div className="border-t border-white/10 pt-6 mb-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4 font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              City Districts
            </h3>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {districts.map((district, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-2.5 rounded-lg ${district.color} hover:bg-white/5 transition-colors cursor-default`}
                >
                  <div className="w-2 h-2 rounded-full bg-white/50" />
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm font-medium">{district.name}</div>
                    <div className="text-gray-500 text-xs">{district.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Building Legend */}
          <div className="border-t border-white/10 pt-6 mb-6">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4 font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" />
              </svg>
              Building Guide
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-4 p-2 bg-white/5 rounded-lg">
                <div className="w-8 h-12 bg-gradient-to-t from-gray-600 to-gray-400 rounded" style={{ clipPath: 'polygon(20% 100%, 80% 100%, 100% 30%, 80% 0%, 20% 0%, 0% 30%)' }} />
                <div>
                  <span className="text-gray-300 font-medium block">Height</span>
                  <span className="text-gray-500 text-xs">Total commit count</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-2 bg-white/5 rounded-lg">
                <div className="w-10 h-6 bg-gray-500 rounded" />
                <div>
                  <span className="text-gray-300 font-medium block">Width</span>
                  <span className="text-gray-500 text-xs">Follower count</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-2 bg-white/5 rounded-lg">
                <div className="w-6 h-6 bg-yellow-400 rounded shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                <div>
                  <span className="text-gray-300 font-medium block">Glow</span>
                  <span className="text-gray-500 text-xs">Star count</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-2 bg-white/5 rounded-lg">
                <div className="w-6 h-6 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="text-gray-300 font-medium block">Golden Ring</span>
                  <span className="text-gray-500 text-xs">Top 10% developer</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reset button */}
          <button
            onClick={() => onFilterChange({
              language: 'all',
              sortBy: 'commits',
              sortOrder: 'desc',
              highlightTop: false
            })}
            className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white rounded-xl transition-all text-sm font-medium"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </>
  );
};

export default ControlPanel;
