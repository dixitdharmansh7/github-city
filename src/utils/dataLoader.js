import Papa from 'papaparse';
import { 
  assignDistrict,
  calculateGridPosition,
  assignBuildingType,
  generateBuildingArchitecture,
  generateRoadNetwork,
  generateParks,
  getDistrictConfig
} from './cityLayout';
import { getLanguageColor } from './languageColors';

export const loadCSVData = async (url) => {
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Get the most recent date from the data
          const dates = results.data
            .map(row => row.last_updated)
            .filter(Boolean)
            .sort()
            .reverse();
          const lastUpdated = dates[0] || new Date().toISOString().split('T')[0];
          
          const processedData = results.data.map((row, index) => ({
            id: index,
            username: row.username || 'unknown',
            repositories: Number(row.repositories) || 0,
            commits: Number(row.commits) || 0,
            stars: Number(row.stars) || 0,
            followers: Number(row.followers) || 0,
            primary_language: row.primary_language || 'Unknown',
            last_updated: row.last_updated || lastUpdated
          }));
          
          // Attach metadata to the array
          processedData.lastUpdated = lastUpdated;
          processedData.totalRecords = processedData.length;
          
          resolve(processedData);
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
};

// Scaling factors for building sizes
export const SCALING = {
  minHeight: 25,
  maxHeight: 180,
  minBaseSize: 8,
  maxBaseSize: 25
};

// Calculate building dimensions
export const calculateBuildingDimensions = (data, districtConfig) => {
  const maxCommits = Math.max(...data.map(d => d.commits), 1);
  const maxFollowers = Math.max(...data.map(d => d.followers), 1);
  const maxStars = Math.max(...data.map(d => d.stars), 1);
  
  return data.map((item) => {
    const commitRatio = item.commits / maxCommits;
    const heightVariation = 0.85 + Math.random() * 0.3;
    
    // Apply district height multiplier
    const heightMult = districtConfig?.heightMultiplier || 1.0;
    
    const height = Math.max(
      SCALING.minHeight,
      Math.min(SCALING.maxHeight, 
        Math.pow(commitRatio, 0.8) * SCALING.maxHeight * 0.9 * heightVariation * heightMult + SCALING.minHeight
      )
    );
    
    const followerRatio = item.followers / maxFollowers;
    const sizeVariation = 0.9 + Math.random() * 0.2;
    
    const baseSize = Math.max(
      SCALING.minBaseSize,
      Math.min(SCALING.maxBaseSize,
        Math.pow(followerRatio, 0.7) * SCALING.maxBaseSize * 0.8 * sizeVariation + SCALING.minBaseSize
      )
    );
    
    return {
      ...item,
      height,
      baseSize,
      glowIntensity: Math.min(1, Math.pow(item.stars / maxStars, 0.7)),
      floors: Math.max(1, Math.floor(item.repositories / 8))
    };
  });
};

// Process data with organized city grid layout
export const processCityData = (data, sortBy = 'commits', sortOrder = 'desc') => {
  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
  });
  
  // Update ranks
  const rankedData = sortedData.map((item, index) => ({
    ...item,
    rank: index
  }));
  
  // Group buildings by district
  const buildingsByDistrict = {};
  
  rankedData.forEach((item) => {
    const district = assignDistrict(item, item.rank, rankedData.length);
    if (!buildingsByDistrict[district]) {
      buildingsByDistrict[district] = [];
    }
    buildingsByDistrict[district].push(item);
  });
  
  // Process each district separately with grid layout
  const allBuildings = [];
  
  Object.entries(buildingsByDistrict).forEach(([district, districtBuildings]) => {
    const config = getDistrictConfig(district);
    const maxBuildings = config.gridSize * config.gridSize;
    
    // Limit buildings per district to grid capacity
    const limitedBuildings = districtBuildings.slice(0, maxBuildings);
    
    // Calculate dimensions with district multiplier
    const withDimensions = calculateBuildingDimensions(limitedBuildings, config);
    
    // Position each building in the grid
    const positionedBuildings = withDimensions.map((item, index) => {
      const pos = calculateGridPosition(index, district, limitedBuildings.length);
      
      const buildingType = assignBuildingType(item, district, item.rank, rankedData.length);
      const architecture = generateBuildingArchitecture(
        buildingType,
        item.height,
        item.baseSize,
        getLanguageColor(item.primary_language),
        item
      );
      
      return {
        ...item,
        district,
        position: [pos.x, 0, pos.z],
        architecture,
        color: getLanguageColor(item.primary_language)
      };
    });
    
    allBuildings.push(...positionedBuildings);
  });
  
  // Generate infrastructure
  const roads = generateRoadNetwork();
  const parks = generateParks();
  
  return {
    buildings: allBuildings,
    roads,
    parks,
    stats: {
      total: allBuildings.length,
      districts: Object.keys(buildingsByDistrict).length,
      avgHeight: allBuildings.reduce((sum, b) => sum + b.height, 0) / allBuildings.length
    }
  };
};

// Filter data
export const filterData = (data, filters) => {
  let result = [...data];
  
  if (filters.language && filters.language !== 'all') {
    result = result.filter(d => d.primary_language === filters.language);
  }
  
  if (filters.highlightTop) {
    const topCount = Math.min(10, Math.floor(result.length * 0.1));
    result = result.map((item, index) => ({
      ...item,
      isHighlighted: index < topCount
    }));
  } else {
    result = result.map(item => ({ ...item, isHighlighted: false }));
  }
  
  return result;
};
