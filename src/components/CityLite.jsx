import { useRef, useMemo, forwardRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BuildingLite from './BuildingLite';
import FlyingCamera from './FlyingCamera';

// Simple ground - no complex materials
const Ground = ({ parks }) => {
  return (
    <>
      {/* Main ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[1200, 1200]} />
        <meshLambertMaterial color="#0f0f1a" />
      </mesh>
      
      {/* Simple grid */}
      <gridHelper args={[1000, 50, '#222', '#1a1a2e']} position={[0, -0.49, 0]} />
      
      {/* Simple park areas - no trees */}
      {parks.slice(0, 3).map((park, index) => (
        <mesh 
          key={index}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[park.x, -0.45, park.z]}
        >
          <circleGeometry args={[park.radius, 16]} />
          <meshLambertMaterial color="#1a3a2a" />
        </mesh>
      ))}
    </>
  );
};

// Simple roads
const Roads = ({ roads }) => {
  return (
    <group>
      {roads.slice(0, 4).map((road, index) => {
        const length = Math.sqrt((road.x2 - road.x1) ** 2 + (road.z2 - road.z1) ** 2);
        const angle = Math.atan2(road.z2 - road.z1, road.x2 - road.x1);
        const midX = (road.x1 + road.x2) / 2;
        const midZ = (road.z1 + road.z2) / 2;
        
        return (
          <mesh 
            key={index}
            rotation={[-Math.PI / 2, 0, angle]} 
            position={[midX, -0.3, midZ]}
          >
            <planeGeometry args={[length, road.width]} />
            <meshLambertMaterial color="#252a3a" />
          </mesh>
        );
      })}
    </group>
  );
};

// Scene content - minimal effects
const SceneContent = ({ 
  buildings, 
  roads, 
  parks, 
  onBuildingHover, 
  onBuildingClick,
  cameraMode,
  onPointerLockChange,
  isPaused,
  currentUser,
  targetUser
}) => {
  // Limit buildings for performance - show top 100 only
  const visibleBuildings = useMemo(() => {
    return buildings.slice(0, 100);
  }, [buildings]);

  return (
    <>
      {/* Simple lighting - no shadows */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[-100, 200, -100]} intensity={0.8} />
      
      <Ground parks={parks} />
      <Roads roads={roads} />
      
      {/* Buildings - limited count, simple rendering */}
      {visibleBuildings.map((building) => (
        <BuildingLite
          key={building.id}
          data={building}
          onHover={onBuildingHover}
          onClick={onBuildingClick}
          isCurrentUser={currentUser && building.username?.toLowerCase() === currentUser.username?.toLowerCase()}
          isTargetUser={targetUser && building.username?.toLowerCase() === targetUser.toLowerCase()}
        />
      ))}
      
      {/* Simple background color - no fog */}
      <color attach="background" args={['#050508']} />
      
      {cameraMode === 'orbit' && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={800}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.02}
          target={[0, 30, 0]}
        />
      )}
      
      {cameraMode === 'fly' && (
        <FlyingCamera 
          enabled={true}
          minHeight={10}
          maxHeight={600}
          movementSpeed={4}
          lookSpeed={0.002}
          onLockChange={onPointerLockChange}
          isPaused={isPaused}
        />
      )}
    </>
  );
};

const CityLite = forwardRef(({ 
  buildings, 
  roads, 
  parks, 
  onBuildingHover, 
  onBuildingClick,
  cameraMode = 'fly',
  onCanvasReady,
  onPointerLockChange,
  isPaused = false,
  currentUser = null,
  targetUser = null
}, ref) => {
  const handleCreated = useCallback(({ gl }) => {
    // Disable expensive WebGL features
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    if (gl?.domElement && onCanvasReady) {
      onCanvasReady(gl.domElement);
    }
  }, [onCanvasReady]);
  
  return (
    <div className="w-full h-full">
      <Canvas
        ref={ref}
        camera={{ 
          position: [250, 100, 250],
          fov: 50,
          near: 1,
          far: 2000
        }}
        gl={{ 
          antialias: false, // Disable AA for performance
          alpha: false,
          powerPreference: 'low-power', // Request low power mode
          stencil: false,
          depth: true
        }}
        dpr={[1, 1.5]} // Limit pixel ratio
        onCreated={handleCreated}
        style={{ pointerEvents: isPaused ? 'none' : 'auto' }}
      >
        <SceneContent 
          buildings={buildings}
          roads={roads}
          parks={parks}
          onBuildingHover={onBuildingHover}
          onBuildingClick={onBuildingClick}
          cameraMode={cameraMode}
          onPointerLockChange={onPointerLockChange}
          isPaused={isPaused}
          currentUser={currentUser}
          targetUser={targetUser}
        />
      </Canvas>
    </div>
  );
});

export default CityLite;
