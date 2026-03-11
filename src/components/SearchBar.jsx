import React, { useState, useEffect, useRef } from 'react';

const SearchBar = ({ buildings, onSelect, selectedBuildingId }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef(null);

    // Close suggestions if clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update suggestions whenever query or buildings change
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = buildings
            .filter(b => b.username && b.username.toLowerCase().includes(lowerQuery))
            .slice(0, 5); // Limit to top 5 hits

        setSuggestions(matches);
    }, [query, buildings]);

    // Clear search text if a search is cancelled externally
    useEffect(() => {
        if (!selectedBuildingId) {
            setQuery('');
        }
    }, [selectedBuildingId]);

    const handleSelect = (building) => {
        setQuery(building.username);
        setIsFocused(false);
        onSelect(building.id);
    };

    const handleClear = () => {
        setQuery('');
        onSelect(null);
    };

    return (
        <div ref={wrapperRef} className="relative w-64 md:w-80 pointer-events-auto">
            <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsFocused(true);
                        if (e.target.value === '' && selectedBuildingId) {
                            onSelect(null);
                        }
                    }}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Search for a profile..."
                    className="w-full bg-[#0a0a0f]/90 border border-gray-700 rounded-full py-1.5 pl-9 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-lg backdrop-blur-md"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 text-gray-500 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {isFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#151520]/95 backdrop-blur-md border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl z-50">
                    {suggestions.map((b) => (
                        <div
                            key={b.id}
                            onClick={() => handleSelect(b)}
                            className="px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color || '#fff' }}></span>
                                <span className="text-gray-200 text-sm font-medium">{b.username}</span>
                            </div>
                            <span className="text-gray-500 text-xs text-right">
                                {b.commits} pts
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {isFocused && query && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#151520]/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-3 text-center text-sm text-gray-500 shadow-2xl z-50">
                    No profiles found.
                </div>
            )}
        </div>
    );
};

export default SearchBar;
