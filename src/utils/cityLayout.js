import { assignBuildingType as assignTypeFromColors } from './languageColors';
export { assignBuildingType as assignBuildingType } from './languageColors';

// District configuration
export const DISTRICTS = {
  downtown: { 
    center: [0, 0], 
    radius: 150, 
    color: '#3b82f6',
    gridSize: 12,
    heightMultiplier: 1.4,
    spacing: 40
  },
  midtown: { 
    center: [0, 0], 
    radius: 220, 
    color: '#6366f1',
    gridSize: 14,
    heightMultiplier: 1.2,
    spacing: 35
  },
  tech: { 
    center: [300, -300], 
    radius: 150, 
    color: '#22c55e',
    gridSize: 12,
    heightMultiplier: 1.1,
    spacing: 38
  },
  industrial: { 
    center: [-300, 300], 
    radius: 180, 
    color: '#f97316',
    gridSize: 10,
    heightMultiplier: 0.9,
    spacing: 45
  },
  residential: { 
    center: [300, 300], 
    radius: 140, 
    color: '#eab308',
    gridSize: 12,
    heightMultiplier: 0.7,
    spacing: 32
  },
  historic: { 
    center: [-300, -300], 
    radius: 120, 
    color: '#ec4899',
    gridSize: 10,
    heightMultiplier: 0.85,
    spacing: 30
  },
  waterfront: { 
    center: [-400, 0], 
    radius: 100, 
    color: '#14b8a6',
    gridSize: 8,
    heightMultiplier: 1.0,
    spacing: 40
  },
  innovation: { 
    center: [0, 400], 
    radius: 130, 
    color: '#8b5cf6',
    gridSize: 11,
    heightMultiplier: 1.15,
    spacing: 36
  }
};

export const getDistrictConfig = (district) => {
  return DISTRICTS[district] || DISTRICTS.midtown;
};

export const assignDistrict = (dev, rank, total) => {
  const percentile = rank / total;
  
  if (percentile <= 0.03) return 'downtown';
  if (percentile <= 0.08) return 'innovation';
  if (percentile <= 0.15) return 'tech';
  if (percentile <= 0.25) return 'midtown';
  if (percentile <= 0.40) return 'historic';
  if (percentile <= 0.60) return 'waterfront';
  if (percentile <= 0.80) return 'industrial';
  return 'residential';
};

export const calculateGridPosition = (index, district, totalInDistrict) => {
  const config = getDistrictConfig(district);
  const { center, spacing } = config;
  const gridSize = Math.ceil(Math.sqrt(totalInDistrict));
  const col = index % gridSize;
  const row = Math.floor(index / gridSize);
  
  const halfGrid = gridSize / 2;
  const x = center[0] + (col - halfGrid) * spacing;
  const z = center[1] + (row - halfGrid) * spacing;
  
  // Add some randomness for organic feel
  const jitter = spacing * 0.15;
  return {
    x: x + (Math.random() - 0.5) * jitter,
    z: z + (Math.random() - 0.5) * jitter
  };
};

export const generateBuildingArchitecture = (type, height, size, color, dev) => {
  const baseWidth = Math.max(6, size);
  const baseDepth = Math.max(6, size * (0.7 + Math.random() * 0.4));
  const segments = [];
  const details = [];
  
  const floorHeight = 3;
  const floors = Math.floor(height / floorHeight);
  
  switch (type) {
    case 'skyscraper':
      {
        const numTiers = Math.floor(Math.random() * 2) + 2;
        let remainingHeight = height;
        let currentWidth = baseWidth;
        let currentDepth = baseDepth;
        
        for (let i = 0; i < numTiers; i++) {
          const tierHeight = i === numTiers - 1 
            ? remainingHeight 
            : remainingHeight * (0.4 + Math.random() * 0.2);
          
          segments.push({
            width: currentWidth,
            depth: currentDepth,
            height: tierHeight,
            round: false
          });
          
          remainingHeight -= tierHeight;
          currentWidth *= 0.7;
          currentDepth *= 0.7;
        }
        
        if (height > 100) {
          details.push({ type: 'antenna', height: height * 0.3 + 20 });
        }
      }
      break;
      
    case 'spire':
      {
        const baseHeight = height * 0.7;
        const spireHeight = height * 0.3;
        
        segments.push({
          width: baseWidth,
          depth: baseDepth,
          height: baseHeight,
          round: false
        });
        
        segments.push({
          width: baseWidth * 0.3,
          depth: baseDepth * 0.3,
          height: spireHeight,
          offsetY: baseHeight,
          round: false
        });
        
        details.push({ type: 'spire', height: spireHeight * 0.8 });
        details.push({ type: 'beacon', height: spireHeight });
      }
      break;
      
    case 'tower':
      {
        segments.push({
          width: baseWidth,
          depth: baseWidth,
          height: height * 0.9,
          round: true
        });
        
        segments.push({
          width: baseWidth * 1.1,
          depth: baseWidth * 1.1,
          height: height * 0.1,
          round: true
        });
        
        details.push({ type: 'antenna', height: 25 });
      }
      break;
      
    case 'terraced':
      {
        const numSteps = Math.floor(Math.random() * 2) + 3;
        const stepHeight = height / numSteps;
        
        for (let i = 0; i < numSteps; i++) {
          const progress = i / (numSteps - 1);
          const width = baseWidth * (1 - progress * 0.6);
          const depth = baseDepth * (1 - progress * 0.6);
          
          segments.push({
            width,
            depth,
            height: stepHeight,
            round: false
          });
        }
      }
      break;
      
    case 'campus':
      {
        const numBuildings = Math.floor(Math.random() * 2) + 3;
        
        for (let i = 0; i < numBuildings; i++) {
          const bWidth = baseWidth * (0.6 + Math.random() * 0.4);
          const bDepth = baseDepth * (0.6 + Math.random() * 0.4);
          const bHeight = height * (0.4 + Math.random() * 0.4);
          
          segments.push({
            width: bWidth,
            depth: bDepth,
            height: bHeight,
            offsetX: (Math.random() - 0.5) * baseWidth * 1.5,
            offsetZ: (Math.random() - 0.5) * baseDepth * 1.5,
            round: false
          });
        }
      }
      break;
      
    case 'complex':
      {
        segments.push({
          width: baseWidth,
          depth: baseDepth,
          height: height * 0.8,
          round: false
        });
        
        const wingHeight = height * 0.5;
        segments.push({
          width: baseWidth * 0.5,
          depth: baseDepth * 1.2,
          height: wingHeight,
          offsetX: baseWidth * 0.6,
          offsetZ: 0,
          round: false
        });
        
        segments.push({
          width: baseWidth * 0.5,
          depth: baseDepth * 1.2,
          height: wingHeight,
          offsetX: -baseWidth * 0.6,
          offsetZ: 0,
          round: false
        });
        
        segments.push({
          width: baseWidth * 1.8,
          depth: baseDepth * 0.4,
          height: height * 0.2,
          offsetY: height * 0.15,
          round: false
        });
      }
      break;
      
    case 'pyramid':
      {
        const numLevels = Math.floor(Math.random() * 3) + 4;
        const levelHeight = height / numLevels;
        
        for (let i = 0; i < numLevels; i++) {
          const progress = i / numLevels;
          const scale = 1 - progress * 0.85;
          
          segments.push({
            width: baseWidth * scale,
            depth: baseDepth * scale,
            height: levelHeight,
            round: false
          });
        }
      }
      break;
      
    case 'compound':
      {
        segments.push({
          width: baseWidth,
          depth: baseDepth,
          height: height * 0.6,
          round: true
        });
        
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const dist = baseWidth * 0.7;
          
          segments.push({
            width: baseWidth * 0.35,
            depth: baseWidth * 0.35,
            height: height * (0.7 + Math.random() * 0.3),
            offsetX: Math.cos(angle) * dist,
            offsetZ: Math.sin(angle) * dist,
            round: true
          });
        }
      }
      break;
      
    case 'monument':
      {
        segments.push({
          width: baseWidth * 0.4,
          depth: baseDepth * 0.4,
          height: height * 0.85,
          round: false
        });
        
        segments.push({
          width: baseWidth * 0.2,
          depth: baseDepth * 0.2,
          height: height * 0.15,
          round: false
        });
        
        details.push({ type: 'beacon', height: height * 0.05 });
      }
      break;
      
    default:
      segments.push({
        width: baseWidth,
        depth: baseDepth,
        height: height,
        round: false
      });
  }
  
  return { segments, details, floors };
};

export const generateRoadNetwork = () => {
  return [
    { x1: -400, z1: 0, x2: 400, z2: 0, width: 20, type: 'highway' },
    { x1: 0, z1: -400, x2: 0, z2: 400, width: 20, type: 'highway' },
    { x1: -350, z1: -350, x2: 350, z2: 350, width: 12, type: 'road' },
    { x1: -350, z1: 350, x2: 350, z2: -350, width: 12, type: 'road' },
    { x1: -300, z1: -150, x2: -300, z2: 150, width: 10, type: 'road' },
    { x1: 300, z1: -150, x2: 300, z2: 150, width: 10, type: 'road' },
    { x1: -150, z1: 300, x2: 150, z2: 300, width: 10, type: 'road' },
    { x1: -150, z1: -300, x2: 150, z2: -300, width: 10, type: 'road' }
  ];
};

export const generateParks = () => {
  return [
    { x: 0, z: 0, radius: 40 },
    { x: 200, z: 200, radius: 30 },
    { x: -250, z: 250, radius: 35 },
    { x: 250, z: -250, radius: 25 },
    { x: -200, z: -200, radius: 30 }
  ];
};

export default {
  DISTRICTS,
  getDistrictConfig,
  assignDistrict,
  calculateGridPosition,
  generateBuildingArchitecture,
  generateRoadNetwork,
  generateParks
};
